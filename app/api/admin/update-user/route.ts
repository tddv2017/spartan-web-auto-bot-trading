import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { z } from "zod";

const UpdateUserSchema = z.object({
  userId: z.string(),
  newExpiryDate: z.string(),
  newPlan: z.enum(["free", "starter", "yearly", "LIFETIME"]),
  daysAdded: z.number().optional()
});

const PLAN_PRICES: Record<string, number> = {
    "starter": 30,
    "yearly": 299,
    "LIFETIME": 9999
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Kiểm tra email Admin
    const ADMIN_EMAILS = ["tddv2017@gmail.com", "itcrazy2021pro@gmail.com"];
    if (!decodedToken.email || !ADMIN_EMAILS.includes(decodedToken.email)) {
        return NextResponse.json({ error: "Permission Denied" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, newExpiryDate, newPlan } = UpdateUserSchema.parse(body);

    await adminDb.runTransaction(async (t) => {
        const userRef = adminDb.collection("users").doc(userId);
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) throw new Error("User not found");

        const userData = userDoc.data() || {};
        
        // 1. Nâng cấp User
        t.update(userRef, {
            expiryDate: new Date(newExpiryDate),
            plan: newPlan,
            accountStatus: 'active',
            updatedAt: new Date()
        });

        // 2. Trả hoa hồng 40%
        const referrerCode = userData.referredBy;
        const price = PLAN_PRICES[newPlan] || 0;
        
        if (referrerCode && price > 0) {
            const refQuery = await adminDb.collection("users").where("licenseKey", "==", referrerCode).limit(1).get();
            
            if (!refQuery.empty) {
                const referrerDoc = refQuery.docs[0];
                const refData = referrerDoc.data();
                const commission = Number((price * 0.4).toFixed(2));
                
                const currentWallet = refData.wallet || { available: 0 };
                t.update(referrerDoc.ref, {
                    "wallet.available": Number((currentWallet.available + commission).toFixed(2)),
                    referrals: (refData.referrals || []).map((r: any) => {
                        if (r.uid === userId) {
                            return { ...r, status: 'approved', plan: newPlan, commission, updatedAt: new Date().toISOString() };
                        }
                        return r;
                    })
                });
            }
        }
    });

    return NextResponse.json({ success: true, message: "✅ Đã kích hoạt & trả hoa hồng!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
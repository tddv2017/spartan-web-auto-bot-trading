import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra quyền Admin (Bắt buộc)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    
    // Check email cứng cho chắc ăn
    if (decoded.email !== "tddv2017@gmail.com") { // Thay bằng email Admin của ngài
        return NextResponse.json({ error: "Không phải Admin!" }, { status: 403 });
    }

    const { userId, amount } = await req.json();
    
    // 2. Xử lý trừ Pending, cộng Total Paid
    const userRef = adminDb.collection("users").doc(userId);
    
    await adminDb.runTransaction(async (t) => {
        const doc = await t.get(userRef);
        if (!doc.exists) throw new Error("User not found");
        
        const data = doc.data() || {};
        const wallet = data.wallet || { pending: 0, total_paid: 0, available: 0 };
        
        // Trừ pending, cộng total_paid
        const newPending = Math.max(0, wallet.pending - amount);
        const newTotalPaid = wallet.total_paid + amount;
        
        t.update(userRef, {
            "wallet.pending": newPending,
            "wallet.total_paid": newTotalPaid,
            "lastPaidAt": new Date()
        });
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
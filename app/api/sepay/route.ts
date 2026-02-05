import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // ⚠️ CHECK KỸ ĐƯỜNG DẪN IMPORT
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';

const PLAN_DEFS: any = {
  'STARTER':  { id: 'starter',  usd: 9,   days: 30,    commission_percent: 0.15 }, 
  'YEARLY':   { id: 'yearly',   usd: 299,  days: 365,   commission_percent: 0.40 }, 
  'LIFETIME': { id: 'LIFETIME', usd: 9999, days: 99999, commission_percent: 0.40 }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, transferAmount } = body;
    const contentUpper = content.toUpperCase();

    console.log(`💰 [1] WEBHOOK NHẬN: ${transferAmount} VND - Nội dung: ${content}`);

    // 1. TÌM KEY
    const keyMatch = contentUpper.match(/SPARTAN-[A-Z0-9]+/); 
    if (!keyMatch) {
        console.log("❌ [LỖI] Không tìm thấy License Key trong nội dung");
        return NextResponse.json({ success: false, message: "No License Key found" });
    }
    const licenseKey = keyMatch[0];
    console.log(`🔍 [2] Key tìm thấy: ${licenseKey}`);

    // 2. TÌM GÓI
    let selectedPlanDef = null;
    if (contentUpper.includes("LIFETIME")) selectedPlanDef = PLAN_DEFS.LIFETIME;
    else if (contentUpper.includes("YEARLY") || contentUpper.includes("VIP")) selectedPlanDef = PLAN_DEFS.YEARLY;
    else if (contentUpper.includes("STARTER") || contentUpper.includes("PRO") || contentUpper.includes("DAILY")) selectedPlanDef = PLAN_DEFS.STARTER;

    if (!selectedPlanDef) {
         console.log("❌ [LỖI] Không xác định được gói (STARTER/YEARLY...)");
         return NextResponse.json({ success: false, message: "Unknown Plan" });
    }
    console.log(`🔍 [3] Gói xác định: ${selectedPlanDef.id} (Giá chuẩn: $${selectedPlanDef.usd})`);

    // 3. TÌM USER TRONG DB
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("licenseKey", "==", licenseKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log(`❌ [LỖI] Key ${licenseKey} không tồn tại trong Firestore "users"`);
        return NextResponse.json({ success: false, message: "User not found" });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    console.log(`✅ [4] Tìm thấy User: ${userData.email} (ID: ${userDoc.id})`);

    // 4. KÍCH HOẠT GÓI
    try {
        let newExpiry;
        if (selectedPlanDef.id === 'LIFETIME') {
            newExpiry = Timestamp.fromDate(new Date("2099-12-31T23:59:59"));
        } else {
            const now = Date.now();
            const currentExp = userData.expiryDate ? userData.expiryDate.seconds * 1000 : 0;
            const baseDate = currentExp > now ? new Date(currentExp) : new Date();
            baseDate.setDate(baseDate.getDate() + selectedPlanDef.days);
            newExpiry = Timestamp.fromDate(baseDate);
        }

        await updateDoc(userDoc.ref, { 
            plan: selectedPlanDef.id,
            expiryDate: newExpiry
        });
        console.log(`🎉 [5] Đã Update gói thành công cho User!`);
    } catch (err) {
        console.error("❌ [LỖI UPDATE DB]:", err);
        return NextResponse.json({ success: false, error: "DB Update Failed" });
    }

    // 5. TRẢ HOA HỒNG
    if (userData.referredBy) {
        console.log(`🔍 [6] Phát hiện người giới thiệu: ${userData.referredBy}`);
        const refQ = query(usersRef, where("licenseKey", "==", userData.referredBy));
        const refSnap = await getDocs(refQ);
        
        if (!refSnap.empty) {
            const resellerDoc = refSnap.docs[0];
            const resellerData = resellerDoc.data();
            const commissionUSD = Math.round(selectedPlanDef.usd * selectedPlanDef.commission_percent);

            try {
                 const newRef = {
                    user: userData.displayName || userData.email,
                    date: new Date().toLocaleDateString('vi-VN'),
                    package: selectedPlanDef.id.toUpperCase(),
                    commission: commissionUSD,
                    status: "approved"
                };
                
                // Cộng tiền ví
                await updateDoc(resellerDoc.ref, {
                    "wallet.available": (resellerData.wallet?.available || 0) + commissionUSD,
                    referrals: arrayUnion(newRef)
                });
                console.log(`💸 [7] Đã cộng ${commissionUSD}$ cho đại lý ${resellerData.email}`);
            } catch (err) {
                 console.error("❌ [LỖI HOA HỒNG]:", err);
            }
        } else {
            console.log("⚠️ [WARN] Mã giới thiệu có, nhưng không tìm thấy User đại lý tương ứng.");
        }
    } else {
        console.log("ℹ️ [INFO] User này không có người giới thiệu (referredBy is null).");
    }

    return NextResponse.json({ success: true, message: "Activated" });

  } catch (error) {
    console.error("🔥 [SERVER ERROR]:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
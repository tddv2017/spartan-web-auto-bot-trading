import { NextRequest, NextResponse } from 'next/server';
// ⚠️ Đảm bảo ông đã có file lib/firebaseAdmin.ts cấu hình service account
import { adminDb } from '@/lib/firebaseAdmin'; 
import { FieldValue } from 'firebase-admin/firestore';

// CẤU HÌNH GÓI (Giá USD & Hoa hồng 40%)
const PLAN_DEFS: any = {
  'STARTER':  { id: 'starter',   usd: 30,   days: 30,    commission_rate: 0.4 }, 
  'YEARLY':   { id: 'yearly',    usd: 299,  days: 365,   commission_rate: 0.4 }, 
  'LIFETIME': { id: 'LIFETIME',  usd: 99999,  days: 99999, commission_rate: 0.4 }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Lấy dữ liệu từ Casso/SePay/Cổng thanh toán
    const { id, content, transferAmount } = body; 
    const contentUpper = content.toUpperCase();

    console.log(`💰 [WEBHOOK] NHẬN: ${transferAmount} VND - Content: ${content}`);

    // --- 1. CHỐNG TRÙNG LẶP (IDEMPOTENCY) ---
    const txRef = adminDb.collection('transactions').doc(String(id));
    const txCheck = await txRef.get();
    if (txCheck.exists) {
        return NextResponse.json({ success: true, message: "Transaction already processed" });
    }

    // --- 2. TÌM LICENSE KEY ---
    const keyMatch = contentUpper.match(/SPARTAN[-]*[A-Z0-9]+/); 
    if (!keyMatch) return NextResponse.json({ success: false, message: "No License Key found" });
    
    let licenseKey = keyMatch[0];
    if (!licenseKey.includes("-")) licenseKey = licenseKey.replace("SPARTAN", "SPARTAN-");

    // --- 3. LẤY TỶ GIÁ USD/VND ---
    let currentRate = 25500;
    try {
        const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const rateData = await rateRes.json();
        if(rateData?.rates?.VND) currentRate = rateData.rates.VND;
    } catch (e) { console.warn("⚠️ Lỗi tỷ giá, dùng mặc định 25.500"); }

    // --- 4. XÁC ĐỊNH GÓI CƯỚC ---
    let selectedPlan = null;
    
    // Ưu tiên 1: Tìm theo tên gói trong nội dung CK
    if (contentUpper.includes("LIFETIME")) selectedPlan = PLAN_DEFS.LIFETIME;
    else if (contentUpper.includes("YEARLY") || contentUpper.includes("VIP")) selectedPlan = PLAN_DEFS.YEARLY;
    else if (contentUpper.includes("STARTER") || contentUpper.includes("PRO")) selectedPlan = PLAN_DEFS.STARTER;

    // Ưu tiên 2: Đoán theo số tiền (Chấp nhận sai số 10%)
    if (!selectedPlan) {
        const usdPaid = transferAmount / currentRate;
        if (usdPaid >= PLAN_DEFS.LIFETIME.usd * 0.9) selectedPlan = PLAN_DEFS.LIFETIME;
        else if (usdPaid >= PLAN_DEFS.YEARLY.usd * 0.9) selectedPlan = PLAN_DEFS.YEARLY;
        else if (usdPaid >= PLAN_DEFS.STARTER.usd * 0.9) selectedPlan = PLAN_DEFS.STARTER;
    }

    if (!selectedPlan) {
         console.log("❌ Không xác định được gói.");
         return NextResponse.json({ success: false, message: "Unknown Plan" });
    }

    // --- 5. TÌM USER TRONG DB ---
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) return NextResponse.json({ success: false, message: "User not found" });

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // --- 6. KÍCH HOẠT GÓI CHO USER ---
    let newExpiry;
    if (selectedPlan.id === 'LIFETIME') {
        newExpiry = new Date("2099-12-31T23:59:59");
    } else {
        const now = new Date();
        // Firebase Admin trả về Timestamp, cần toDate()
        const currentExp = userData.expiryDate?.toDate ? userData.expiryDate.toDate() : new Date();
        const baseDate = (currentExp > now) ? currentExp : now;
        baseDate.setDate(baseDate.getDate() + selectedPlan.days);
        newExpiry = baseDate;
    }

    await userDoc.ref.update({ 
        plan: selectedPlan.id,
        expiryDate: newExpiry,
        accountStatus: 'active',
        updatedAt: FieldValue.serverTimestamp()
    });

    // Lưu giao dịch để không xử lý lại
    await txRef.set({
        userId: userId,
        amount: transferAmount,
        plan: selectedPlan.id,
        licenseKey: licenseKey,
        createdAt: FieldValue.serverTimestamp()
    });

    console.log(`✅ Đã kích hoạt gói ${selectedPlan.id} cho ${userData.email}`);

    // --- 7. TÍNH & CỘNG HOA HỒNG (40%) ---
    if (userData.referredBy) {
         const refSnap = await usersRef.where("licenseKey", "==", userData.referredBy).limit(1).get();
         
         if (!refSnap.empty) {
            const referrerDoc = refSnap.docs[0];
            const refData = referrerDoc.data();
            
            // Tính hoa hồng (USD)
            const commissionAmount = Number((selectedPlan.usd * selectedPlan.commission_rate).toFixed(2));
            
            // Cập nhật ví Sếp
            await referrerDoc.ref.update({
                "wallet.available": FieldValue.increment(commissionAmount),
                // Đồng bộ cấu trúc Referral object với AuthContext
                referrals: FieldValue.arrayUnion({
                    uid: userId,
                    email: userData.email,
                    date: new Date().toISOString(),
                    plan: selectedPlan.id,
                    commission: commissionAmount,
                    status: "approved",
                    updatedAt: new Date().toISOString()
                })
            });
            console.log(`💸 Đã cộng $${commissionAmount} cho đại lý.`);
         }
    }

    return NextResponse.json({ success: true, message: "Activated & Commission Distributed" });

  } catch (error) {
    console.error("🔥 WEBHOOK ERROR:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
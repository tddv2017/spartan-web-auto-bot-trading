import { NextRequest, NextResponse } from 'next/server';
// ⚠️ QUAN TRỌNG: Dùng adminDb để có quyền ghi đè (Bypass Rules)
// Nếu chưa có file firebase-admin.ts, hãy báo tôi để tôi cung cấp code
import { adminDb } from '@/lib/firebaseAdmin'; 
import { FieldValue } from 'firebase-admin/firestore';

// CẤU HÌNH GÓI (Giá USD)
const PLAN_DEFS: any = {
  'STARTER':  { id: 'starter',  usd: 30,   days: 30,    commission_percent: 0.15 }, 
  'YEARLY':   { id: 'yearly',   usd: 299,  days: 365,   commission_percent: 0.40 }, 
  'LIFETIME': { id: 'LIFETIME', usd: 9999, days: 99999, commission_percent: 0.40 }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // id: Mã giao dịch ngân hàng (Dùng để chống trùng lặp)
    const { id, content, transferAmount } = body; 
    const contentUpper = content.toUpperCase();

    console.log(`💰 [1] WEBHOOK NHẬN: ${transferAmount} VND - Nội dung: ${content}`);

    // --- 🛡️ CHỐNG TRÙNG LẶP (IDEMPOTENCY) ---
    // Kiểm tra xem mã giao dịch này đã xử lý chưa
    const txCheck = await adminDb.collection('transactions').doc(String(id)).get();
    if (txCheck.exists) {
        console.log("⚠️ Giao dịch này đã xử lý rồi. Bỏ qua.");
        return NextResponse.json({ success: true, message: "Already processed" });
    }

    // 1. TÌM KEY SPARTAN
    const keyMatch = contentUpper.match(/SPARTAN[-]*[A-Z0-9]+/); 
    if (!keyMatch) {
        return NextResponse.json({ success: false, message: "No License Key found" });
    }
    
    let licenseKey = keyMatch[0];
    if (!licenseKey.includes("-")) {
        licenseKey = licenseKey.replace("SPARTAN", "SPARTAN-");
    }

    // 2. LẤY TỶ GIÁ
    let currentRate = 25500;
    try {
        const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const rateData = await rateRes.json();
        if(rateData?.rates?.VND) currentRate = rateData.rates.VND;
    } catch (e) { console.warn("⚠️ Lỗi tỷ giá, dùng 25.500"); }

    // 3. XÁC ĐỊNH GÓI (CÓ CƠ CHẾ DỰ PHÒNG THEO TIỀN)
    let selectedPlanDef = null;
    
    // Cách 1: Tìm theo tên trong nội dung
    if (contentUpper.includes("LIFETIME")) selectedPlanDef = PLAN_DEFS.LIFETIME;
    else if (contentUpper.includes("YEARLY") || contentUpper.includes("VIP")) selectedPlanDef = PLAN_DEFS.YEARLY;
    else if (contentUpper.includes("STARTER") || contentUpper.includes("PRO")) selectedPlanDef = PLAN_DEFS.STARTER;

    // Cách 2: Nếu không thấy tên, đoán theo số tiền (USD)
    if (!selectedPlanDef) {
        const usdPaid = transferAmount / currentRate;
        if (usdPaid >= PLAN_DEFS.LIFETIME.usd * 0.9) selectedPlanDef = PLAN_DEFS.LIFETIME;
        else if (usdPaid >= PLAN_DEFS.YEARLY.usd * 0.9) selectedPlanDef = PLAN_DEFS.YEARLY;
        else if (usdPaid >= PLAN_DEFS.STARTER.usd * 0.9) selectedPlanDef = PLAN_DEFS.STARTER;
    }

    if (!selectedPlanDef) {
         console.log("❌ Không xác định được gói nào khớp với số tiền.");
         return NextResponse.json({ success: false, message: "Unknown Plan" });
    }

    // 4. KIỂM TRA SỐ TIỀN (DOUBLE CHECK)
    const expectedAmount = selectedPlanDef.usd * currentRate;
    const minAcceptable = expectedAmount - 50000; // Buffer 50k

    if (transferAmount < minAcceptable) {
         console.warn(`❌ TỪ CHỐI: Tiền thiếu. Nhận: ${transferAmount}, Cần: ${expectedAmount}`);
         return NextResponse.json({ success: false, message: "Amount too low" });
    }

    // 5. TÌM USER (Dùng Admin SDK)
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
        return NextResponse.json({ success: false, message: "User not found" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // 6. KÍCH HOẠT GÓI & LƯU LỊCH SỬ GIAO DỊCH
    try {
        let newExpiry;
        if (selectedPlanDef.id === 'LIFETIME') {
            newExpiry = new Date("2099-12-31T23:59:59");
        } else {
            const now = new Date();
            // userData.expiryDate ở Admin SDK là Timestamp, cần toDate()
            const currentExp = userData.expiryDate ? userData.expiryDate.toDate() : new Date();
            const baseDate = currentExp > now ? currentExp : now;
            baseDate.setDate(baseDate.getDate() + selectedPlanDef.days);
            newExpiry = baseDate;
        }

        // Cập nhật User
        await userDoc.ref.update({ 
            plan: selectedPlanDef.id,
            expiryDate: newExpiry,
            lastPaymentId: id // Lưu lại mã giao dịch gần nhất
        });

        // Lưu vào collection transactions để chống trùng lặp sau này
        await adminDb.collection('transactions').doc(String(id)).set({
            userId: userDoc.id,
            amount: transferAmount,
            plan: selectedPlanDef.id,
            licenseKey: licenseKey,
            createdAt: FieldValue.serverTimestamp()
        });

        console.log(`🎉 Kích hoạt thành công gói ${selectedPlanDef.id}`);

    } catch (err) {
        console.error("❌ Lỗi DB:", err);
        return NextResponse.json({ success: false, error: "DB Error" });
    }

    // 7. HOA HỒNG (Dùng Admin SDK)
    if (userData.referredBy) {
         const refSnap = await usersRef.where("licenseKey", "==", userData.referredBy).limit(1).get();
         
         if (!refSnap.empty) {
            const resellerDoc = refSnap.docs[0];
            const commissionUSD = Math.round(selectedPlanDef.usd * selectedPlanDef.commission_percent);
            
            const newRef = {
                user: userData.displayName || userData.email,
                date: new Date().toLocaleDateString('vi-VN'),
                package: selectedPlanDef.id.toUpperCase(),
                commission: commissionUSD,
                status: "approved"
            };

            // Dùng arrayUnion của Admin SDK
            await resellerDoc.ref.update({
                "wallet.available": FieldValue.increment(commissionUSD),
                referrals: FieldValue.arrayUnion(newRef)
            });
            console.log(`💸 Đã cộng hoa hồng: $${commissionUSD}`);
         }
    }

    return NextResponse.json({ success: true, message: "Activated" });

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
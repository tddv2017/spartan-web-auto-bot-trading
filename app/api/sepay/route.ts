import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // ⚠️ Kiểm tra lại đường dẫn import db
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';

// CẤU HÌNH GÓI CƠ BẢN (Giá USD)
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

    console.log(`💰 WEBHOOK: Nhận ${transferAmount} VND - Nội dung: ${content}`);

    // 1. TÌM LICENSE KEY (Bắt đầu bằng SPARTAN-)
    const keyMatch = contentUpper.match(/SPARTAN-[A-Z0-9]+/); 
    if (!keyMatch) return NextResponse.json({ success: false, message: "No License Key found" });
    const licenseKey = keyMatch[0];

    // 2. LẤY TỶ GIÁ THỰC TẾ (REAL-TIME)
    // Để khớp với Frontend, ta gọi cùng 1 API
    let currentRate = 25500; // Giá fallback phòng khi API lỗi
    try {
        const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const rateData = await rateRes.json();
        if(rateData?.rates?.VND) currentRate = rateData.rates.VND;
    } catch (e) { 
        console.warn("⚠️ Không lấy được tỷ giá, dùng mặc định 25.500"); 
    }

    console.log(`📊 Tỷ giá áp dụng: 1 USD = ${currentRate} VND`);

    // 3. XÁC ĐỊNH GÓI DỰA VÀO NỘI DUNG (Content Check)
    let selectedPlanDef = null;
    if (contentUpper.includes("LIFETIME")) selectedPlanDef = PLAN_DEFS.LIFETIME;
    else if (contentUpper.includes("YEARLY") || contentUpper.includes("VIP")) selectedPlanDef = PLAN_DEFS.YEARLY;
    else if (contentUpper.includes("STARTER") || contentUpper.includes("PRO") || contentUpper.includes("DAILY")) selectedPlanDef = PLAN_DEFS.STARTER;

    if (!selectedPlanDef) return NextResponse.json({ success: false, message: "Unknown Plan in Content" });

    // 4. KIỂM TRA SỐ TIỀN (AN TOÀN)
    // Tính tiền chuẩn theo tỷ giá hôm nay
    const expectedAmount = selectedPlanDef.usd * currentRate;
    
    // Cho phép sai số: Thấp hơn tối đa 20.000đ (do làm tròn hoặc phí)
    const minAcceptable = expectedAmount - 20000; 

    // if (transferAmount < minAcceptable) {
    //     console.warn(`❌ TỪ CHỐI: Tiền thiếu. Nhận: ${transferAmount}, Cần tối thiểu: ${minAcceptable}`);
    //     return NextResponse.json({ success: false, message: "Amount too low" });
    // }

    // 5. KÍCH HOẠT USER
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("licenseKey", "==", licenseKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return NextResponse.json({ success: false, message: "User not found" });

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Tính ngày hết hạn mới
    let newExpiry;
    if (selectedPlanDef.id === 'LIFETIME') {
        newExpiry = Timestamp.fromDate(new Date("2099-12-31T23:59:59"));
    } else {
        const now = Date.now();
        const currentExp = userData.expiryDate ? userData.expiryDate.seconds * 1000 : 0;
        // Nếu còn hạn thì cộng nối tiếp, hết hạn thì tính từ bây giờ
        const baseDate = currentExp > now ? new Date(currentExp) : new Date();
        baseDate.setDate(baseDate.getDate() + selectedPlanDef.days);
        newExpiry = Timestamp.fromDate(baseDate);
    }

    await updateDoc(userDoc.ref, { 
        plan: selectedPlanDef.id,
        expiryDate: newExpiry
    });

    console.log(`✅ KÍCH HOẠT THÀNH CÔNG: ${selectedPlanDef.id} cho ${userData.email}`);

    // 6. TRẢ HOA HỒNG CHO ĐẠI LÝ (Nếu có)
    if (userData.referredBy) {
        const refQ = query(usersRef, where("licenseKey", "==", userData.referredBy));
        const refSnap = await getDocs(refQ);
        
        if (!refSnap.empty) {
            const resellerDoc = refSnap.docs[0];
            const resellerData = resellerDoc.data();
            
            // Hoa hồng tính theo USD (Lưu vào ví)
            const commissionUSD = Math.round(selectedPlanDef.usd * selectedPlanDef.commission_percent);

            const newRef = {
                user: userData.displayName || userData.email,
                date: new Date().toLocaleDateString('vi-VN'),
                package: selectedPlanDef.id.toUpperCase(),
                commission: commissionUSD,
                status: "approved"
            };

            const oldRef = resellerData.referrals?.find((r: any) => r.user === (userData.displayName || userData.email));

            await updateDoc(resellerDoc.ref, {
                "wallet.available": (resellerData.wallet?.available || 0) + commissionUSD,
                referrals: oldRef ? arrayRemove(oldRef) : resellerData.referrals
            });
            await updateDoc(resellerDoc.ref, { referrals: arrayUnion(newRef) });
            console.log(`💸 Đã cộng hoa hồng đại lý: $${commissionUSD}`);
        }
    }

    return NextResponse.json({ success: true, message: "Activated" });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
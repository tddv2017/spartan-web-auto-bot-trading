import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"; 

export async function POST(req: Request) {
  try {
    // 1. KIỂM TRA GIẤY TỜ (AUTH)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userEmail = decodedToken.email || "";
    const requesterId = decodedToken.uid;

    // 2. ĐỌC LỆNH TỪ FRONTEND
    const body = await req.json();
    const { amount, action, userId, reason } = body;
    const safeAmount = amount ? Number(amount) : 0;

    // ==================================================================
    // 🛑 TRƯỜNG HỢP 1: ADMIN HỦY LỆNH (CANCEL_BY_ADMIN)
    // ==================================================================
    if (action === 'cancel_by_admin') {
        // Check quyền Tướng Lĩnh
        if (userEmail !== "tddv2017@gmail.com" && userEmail !== "itcrazy2021pro@gmail.com") 
            return NextResponse.json({ success: false, message: "Cấm tọc mạch!" }, { status: 403 });

        if (!userId) return NextResponse.json({ success: false, message: "Thiếu ID lính!" }, { status: 400 });

        const targetRef = adminDb.collection("users").doc(userId);
        
        await adminDb.runTransaction(async (t) => {
            const doc = await t.get(targetRef);
            if (!doc.exists) throw new Error("Không tìm thấy lính này");
            
            const wallet = doc.data()?.wallet || { available: 0, pending: 0 };
            const currentPending = Number(wallet.pending) || 0;
            const currentAvailable = Number(wallet.available) || 0;

            if (currentPending <= 0) throw new Error("Lính này không có tiền kẹt để hoàn!");

            // ✅ PHÉP CỘNG: TRẢ TIỀN TỪ KHO CHỜ VỀ VÍ KHẢ DỤNG
            // (Tuyệt đối không đụng đến safeAmount gửi lên, chỉ tin vào database)
            const newAvailable = Number((currentAvailable + currentPending).toFixed(2));
            
            t.update(targetRef, {
                "wallet.available": newAvailable, 
                "wallet.pending": 0,
                "lastNotification": `Lệnh rút tiền bị từ chối. Lý do: ${reason || 'Admin hủy'}`
            });
        });
        return NextResponse.json({ success: true, message: "✅ Đã hoàn tiền về ví thành công!" });
    }

    // ==================================================================
    // 🟢 TRƯỜNG HỢP 2: ADMIN DUYỆT TIỀN (APPROVE)
    // ==================================================================
    else if (action === 'approve') {
        if (userEmail !== "tddv2017@gmail.com" && userEmail !== "itcrazy2021pro@gmail.com") 
            return NextResponse.json({ success: false, message: "Cấm tọc mạch!" }, { status: 403 });

        const targetRef = adminDb.collection("users").doc(userId);
        await adminDb.runTransaction(async (t) => {
            const doc = await t.get(targetRef);
            const wallet = doc.data()?.wallet || { pending: 0, total_paid: 0 };
            
            const currentPending = Number(wallet.pending) || 0;
            const currentTotalPaid = Number(wallet.total_paid) || 0;

            // ✅ XỬ LÝ: XÓA PENDING, TĂNG TỔNG ĐÃ TRẢ
            t.update(targetRef, {
                "wallet.pending": 0,
                "wallet.total_paid": Number((currentTotalPaid + currentPending).toFixed(2)),
                "lastPaidAt": new Date()
            });
        });
        return NextResponse.json({ success: true, message: "✅ Đã giải ngân thành công!" });
    }

    // ==================================================================
    // 🟡 TRƯỜNG HỢP 3: LÍNH TỰ GỬI YÊU CẦU RÚT (REQUEST)
    // ==================================================================
    else if (action === 'request') {
        // Lính tự gọi thì lấy ID từ Token
        const userRef = adminDb.collection("users").doc(requesterId); 
        
        await adminDb.runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (!doc.exists) throw new Error("Tài khoản không tồn tại");
            
            const wallet = doc.data()?.wallet || { available: 0, pending: 0 };
            const currentAvailable = Number(wallet.available) || 0;
            const currentPending = Number(wallet.pending) || 0;
            
            // Validate
            if (safeAmount < 10) throw new Error("Tối thiểu rút $10");
            if (currentPending > 0) throw new Error("Đang có lệnh chờ, không được rút thêm!");
            if (currentAvailable < safeAmount) throw new Error("Số dư không đủ!");

            // ✅ PHÉP TRỪ: GIẢM VÍ, TĂNG PENDING
            t.update(userRef, {
                "wallet.available": Number((currentAvailable - safeAmount).toFixed(2)),
                "wallet.pending": safeAmount,
                "lastWithdrawRequest": new Date()
            });
        });
        return NextResponse.json({ success: true, message: "✅ Đã gửi yêu cầu rút tiền!" });
    }

    // ==================================================================
    // ❌ TRƯỜNG HỢP LẠ (CHẶN ĐỨNG)
    // ==================================================================
    else {
        return NextResponse.json({ success: false, message: `Hành động "${action}" không hợp lệ!` }, { status: 400 });
    }

  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Lỗi Server" }, { status: 500 });
  }
}
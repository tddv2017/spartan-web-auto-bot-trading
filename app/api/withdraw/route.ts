import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"; 

// Cấu hình Telegram (Giữ nguyên)
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_ID;

export async function POST(req: Request) {
  try {
    console.log("--------------- BẮT ĐẦU RÚT TIỀN ---------------");
    
    // 1. LẤY TOKEN TỪ HEADER
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("❌ Lỗi: Không có Header Authorization");
        return NextResponse.json({ success: false, message: "Không có quyền truy cập!" }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let uid = "";
    let emailFromToken = "";

    // 2. GIẢI MÃ TOKEN (Để lấy UID thật)
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        uid = decodedToken.uid;
        emailFromToken = decodedToken.email || "";
        console.log("✅ Auth OK. UID:", uid);
    } catch (e) {
        console.log("❌ Lỗi verify token:", e);
        return NextResponse.json({ success: false, message: "Token không hợp lệ!" }, { status: 403 });
    }

    // 3. ĐỌC DỮ LIỆU GỬI LÊN
    const body = await req.json();
    console.log("📦 Body nhận được:", body);
    
    const { amount } = body; // Chỉ cần lấy amount, không cần uid từ body nữa

    // 4. KIỂM TRA DỮ LIỆU
    if (!amount || isNaN(amount) || amount <= 0) {
        console.log("❌ Lỗi: Số tiền không hợp lệ. Amount =", amount);
        return NextResponse.json({ success: false, message: "Số tiền không hợp lệ!" }, { status: 400 });
    }

    // 5. THỰC HIỆN GIAO DỊCH (TRANSACTION)
    const userRef = adminDb.collection("users").doc(uid); // Dùng UID từ Token

    const result = await adminDb.runTransaction(async (t) => {
        const doc = await t.get(userRef);
        
        if (!doc.exists) { throw new Error("Tài khoản không tồn tại!"); }

        const userData = doc.data() || {};
        const currentWallet = userData.wallet || { available: 0, pending: 0, total_paid: 0 };
        console.log("💰 Số dư hiện tại:", currentWallet.available, "| Muốn rút:", amount);

        if (amount > currentWallet.available) {
            throw new Error("Số dư không đủ!");
        }

        const newAvailable = Number((currentWallet.available - amount).toFixed(2));
        const newPending = Number((currentWallet.pending + amount).toFixed(2));

        t.update(userRef, {
            "wallet.available": newAvailable,
            "wallet.pending": newPending,
            "lastWithdrawRequest": new Date()
        });

        return { newAvailable, newPending };
    });

    console.log("✅ RÚT TIỀN THÀNH CÔNG!");

    // 6. GỬI TELEGRAM (Optional)
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                chat_id: TELEGRAM_CHAT_ID, 
                text: `💸 <b>RÚT TIỀN:</b> ${emailFromToken}\n💰 <b>$${amount}</b>\n✅ <b>Còn:</b> $${result.newAvailable}`, 
                parse_mode: "HTML" 
            }),
        }).catch(err => console.error("Tele Error:", err));
    }

    return NextResponse.json({ 
      success: true, 
      message: `✅ Lệnh rút $${amount} thành công! Đang chờ duyệt.` 
    });

  } catch (error: any) {
    console.error("🔥 LỖI SERVER:", error.message);
    return NextResponse.json({ success: false, message: error.message || "Lỗi Server" }, { status: 500 }); // Đổi thành 500 nếu lỗi code
  }
}
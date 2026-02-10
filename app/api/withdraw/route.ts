import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"; 
import { z } from "zod"; 

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_ID;

// Định nghĩa khuôn mẫu (Schema)
const WithdrawSchema = z.object({
  amount: z.number()
    .min(10, "Tối thiểu phải rút $10") 
    .max(10000, "Tối đa rút $10,000/lần") 
    .positive("Số tiền phải lớn hơn 0"),
});

export async function POST(req: Request) {
  try {
    console.log("--------------- BẮT ĐẦU RÚT TIỀN ---------------");
    
    // 1. LẤY TOKEN TỪ HEADER
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ success: false, message: "Không có quyền truy cập!" }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let uid = "";
    let emailFromToken = "";

    // 2. GIẢI MÃ TOKEN
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        uid = decodedToken.uid;
        emailFromToken = decodedToken.email || "";
    } catch (e) {
        console.log("❌ Lỗi verify token:", e);
        return NextResponse.json({ success: false, message: "Token không hợp lệ!" }, { status: 403 });
    }

    // 3. ĐỌC DỮ LIỆU
    const body = await req.json();
    
    // 🔥 4. DÙNG ZOD VALIDATION (Thay thế đoạn if cũ)
    const validation = WithdrawSchema.safeParse(body);

    if (!validation.success) {
        // Lấy thông báo lỗi tiếng Việt đầu tiên
        const errorMessage = validation.error.issues[0].message;
        console.log("❌ Lỗi Validation:", errorMessage);
        return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
    }

    // Lấy dữ liệu sạch từ Zod
    const { amount } = validation.data;

    // 5. THỰC HIỆN GIAO DỊCH (TRANSACTION)
    const userRef = adminDb.collection("users").doc(uid); 

    const result = await adminDb.runTransaction(async (t) => {
        const doc = await t.get(userRef);
        if (!doc.exists) { throw new Error("Tài khoản không tồn tại!"); }

        const userData = doc.data() || {};
        const currentWallet = userData.wallet || { available: 0, pending: 0, total_paid: 0 };
        
        console.log(`💰 User: ${emailFromToken} | Dư: ${currentWallet.available} | Rút: ${amount}`);

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

    // 6. GỬI TELEGRAM
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
        // Chạy nền, không cần await để trả response cho nhanh
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
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
    // Trả về lỗi cụ thể từ transaction (ví dụ: Số dư không đủ)
    return NextResponse.json({ success: false, message: error.message || "Lỗi Server" }, { status: 500 });
  }
}
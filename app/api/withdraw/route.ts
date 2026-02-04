import { NextResponse } from 'next/server';
// 👇 CHỈ ĐƯỢC IMPORT CÁI NÀY (Admin SDK)
import { adminDb } from "@/lib/firebaseAdmin"; // ⚠️ Sửa đường dẫn nếu file nằm ở chỗ khác (vd: @/lib/firebaseAdmin)

// Cấu hình Telegram
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_ID;

export const dynamic = 'force-dynamic'; 

async function sendTelegramAlert(msg: string) {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: "HTML" }),
        });
    } catch (e) { console.error("Tele Error", e); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, email } = body;

    // 1. Kiểm tra đầu vào
    if (!email || !amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    // 2. Tìm User bằng Admin SDK
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // 3. Lấy ví (Xử lý trường hợp chưa có ví)
    const currentWallet = userData.wallet || { available: 0, pending: 0, total_paid: 0 };

    // 4. Kiểm tra số dư
    if (amount > currentWallet.available) {
      return NextResponse.json({ success: false, message: "⚠️ Số dư không đủ!" }, { status: 400 });
    }

    // 5. Tính toán ví mới (Làm tròn 2 số lẻ để tránh lỗi float)
    const newAvailable = Number((currentWallet.available - amount).toFixed(2));
    const newPending = Number((currentWallet.pending + amount).toFixed(2));

    const newWallet = {
      ...currentWallet,
      available: newAvailable,
      pending: newPending
    };

    // 6. Cập nhật Firestore (Dùng cú pháp Admin: doc(id).update)
    await usersRef.doc(userDoc.id).update({
      wallet: newWallet,
      lastWithdrawRequest: new Date()
    });

    // 7. Gửi Telegram (Chạy ngầm, không await để phản hồi nhanh)
    await sendTelegramAlert(
        `💸 <b>CÓ LỆNH RÚT TIỀN MỚI!</b>\n\n` +
        `👤 <b>User:</b> ${email}\n` +
        `💰 <b>Rút:</b> $${amount}\n` +
        `🏦 <b>Còn lại:</b> $${newWallet.available}\n` +
        `⏳ <b>Trạng thái:</b> Chờ duyệt`
    ).catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: `✅ Lệnh rút $${amount} thành công! Vui lòng chờ duyệt.` 
    });

  } catch (error: any) {
    console.error("🔥 WITHDRAW ERROR:", error);
    // Trả về message lỗi cụ thể để debug
    return NextResponse.json({ success: false, message: "Lỗi Server: " + error.message }, { status: 500 });
  }
}
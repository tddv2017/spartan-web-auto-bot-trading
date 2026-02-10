import { NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebaseAdmin"; 

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
    const { amount, uid, email } = body; // 👇 Nhận thêm UID để tìm doc cho nhanh

    // 1. Kiểm tra đầu vào
    if (!uid || !amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(uid);

    // 🔥 TRANSACTION: BẮT ĐẦU KHÓA KHO ĐỂ KIỂM KÊ
    const result = await adminDb.runTransaction(async (t) => {
        const doc = await t.get(userRef);
        
        if (!doc.exists) {
            throw new Error("Không tìm thấy tài khoản!");
        }

        const userData = doc.data() || {};
        const currentWallet = userData.wallet || { available: 0, pending: 0, total_paid: 0 };

        // Kiểm tra số dư (Trong lúc transaction chạy, không ai được can thiệp)
        if (amount > currentWallet.available) {
            throw new Error("⚠️ Số dư không đủ!");
        }

        const newAvailable = Number((currentWallet.available - amount).toFixed(2));
        const newPending = Number((currentWallet.pending + amount).toFixed(2));

        // Cập nhật ví mới
        t.update(userRef, {
            "wallet.available": newAvailable,
            "wallet.pending": newPending,
            "lastWithdrawRequest": new Date()
        });

        return { newAvailable, newPending }; // Trả về số dư mới để báo cáo
    });

    // 2. Gửi Telegram báo cáo (Chỉ chạy khi Transaction thành công)
    sendTelegramAlert(
        `💸 <b>LỆNH RÚT TIỀN MỚI! (SECURE)</b>\n\n` +
        `👤 <b>User:</b> ${email}\n` +
        `🆔 <b>ID:</b> <code>${uid}</code>\n` +
        `💰 <b>Rút:</b> $${amount}\n` +
        `🏦 <b>Còn lại:</b> $${result.newAvailable}\n` +
        `⏳ <b>Pending:</b> $${result.newPending}`
    ).catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: `✅ Lệnh rút $${amount} thành công! Vui lòng chờ duyệt.` 
    });

  } catch (error: any) {
    console.error("🔥 WITHDRAW ERROR:", error);
    return NextResponse.json({ 
        success: false, 
        message: error.message || "Lỗi Server" 
    }, { status: 500 });
  }
}
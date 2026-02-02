import { adminDb } from "../../../lib/firebaseAdmin";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic'; // 👈 DÒNG LỆNH BÀI MIỄN TỬ

// 🚀 1. HÀM GỬI THÔNG BÁO VỀ TELEGRAM
async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_ID;
  
  if (!token || !chatId) {
    console.error("❌ Thiếu cấu hình Telegram trên Vercel!");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: message, 
        parse_mode: "HTML" 
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error("❌ Telegram API báo lỗi:", result.description);
    } else {
      console.log("✅ Đã gửi quân lệnh về Telegram!");
    }
  } catch (e) {
    console.error("❌ Lỗi kết nối Telegram:", e);
  }
}

// 🚀 2. HÀM XỬ LÝ CHÍNH
export async function POST(req: Request) {
  try {
    const { licenseKey, mt5Account } = await req.json();

    if (!licenseKey || !mt5Account) {
      return NextResponse.json({ valid: false, message: "Thieu thong tin xac thuc" });
    }

    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).get();

    if (snapshot.empty) {
      return NextResponse.json({ valid: false, message: "KEY KHONG TON TAI" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    const currentMT5 = userData.mt5Account ? String(userData.mt5Account).trim() : "";
    const incomingMT5 = String(mt5Account).trim();

    // 🔐 LOGIC KHÓA TÀI KHOẢN & GỬI THÔNG BÁO
    if (currentMT5 === "" || currentMT5 === "0") {
      // Cập nhật Database
      await usersRef.doc(userId).update({ mt5Account: incomingMT5 });
      
      // 📢 Báo tin vui về Telegram
      await sendTelegramAlert(
        `🚀 <b>LÍNH MỚI NHẬP NGŨ!</b>\n\n` +
        `🔹 <b>Key:</b> <code>${licenseKey}</code>\n` + 
        `🔹 <b>MT5:</b> <code>${incomingMT5}</code>\n` +
        `✅ <b>Trạng thái:</b> Kích hoạt thành công!`
      );

      return NextResponse.json({ valid: true, message: "Kich hoat thanh cong!" });
    }

    // Kiểm tra nếu sai tài khoản đã khóa
    if (currentMT5 !== incomingMT5) {
      return NextResponse.json({ 
        valid: false, 
        message: `Key da khoa cho TK: ${currentMT5}` 
      });
    }

    // Nếu khớp tài khoản cũ
    return NextResponse.json({ valid: true, message: "Xac thuc thanh cong" });

  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error);
    return NextResponse.json({ valid: false, message: "Loi he thong bao mat" }, { status: 500 });
  }
}
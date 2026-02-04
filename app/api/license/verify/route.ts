import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// 🛑 BẮT BUỘC: Đảm bảo API luôn chạy dynamic (không bị cache)
export const dynamic = 'force-dynamic';

// 📡 CẤU HÌNH TELEGRAM
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_ID;

// 📨 HÀM GỬI TIN NHẮN (Tối ưu hóa)
async function sendTelegramLog(type: 'SUCCESS' | 'WARNING' | 'ERROR', message: string) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;

  const icon = type === 'SUCCESS' ? '🟢' : type === 'WARNING' ? '⚠️' : '🔴';
  const htmlMsg = `${icon} <b>[LICENSE SYSTEM]</b>\n\n${message}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: htmlMsg,
        parse_mode: "HTML"
      }),
    });
  } catch (e) {
    console.error("Telegram Error:", e);
  }
}

export async function POST(req: Request) {
  try {
    // 1. NHẬN DỮ LIỆU TỪ BOT
    const body = await req.json();
    const { licenseKey, mt5Account } = body;

    if (!licenseKey || !mt5Account) {
      return NextResponse.json({ valid: false, message: "Missing Data" }, { status: 400 });
    }

    // 2. TRUY VẤN FIRESTORE (Dùng Admin SDK quyền lực nhất)
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
      await sendTelegramLog('ERROR', `Phát hiện Key lạ cố xâm nhập: <code>${licenseKey}</code>`);
      return NextResponse.json({ valid: false, message: "INVALID KEY" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // 3. XỬ LÝ LOGIC MT5 (Chuẩn hóa String để so sánh chính xác)
    const currentMT5 = userData.mt5Account ? String(userData.mt5Account).trim() : "";
    const incomingMT5 = String(mt5Account).trim();

    // 4. KIỂM TRA HẠN SỬ DỤNG (QUAN TRỌNG)
    let isExpired = false;
    let expiryStr = "LIFETIME";
    
    // Nếu không phải gói LIFETIME thì check ngày
    if (userData.plan !== 'LIFETIME' && userData.expiryDate) {
        const now = new Date();
        const expiryDate = userData.expiryDate.toDate(); // Chuyển Timestamp -> Date
        expiryStr = expiryDate.toLocaleDateString('vi-VN');

        if (expiryDate < now) {
            isExpired = true;
        }
    }

    // 🛑 CHẶN NẾU HẾT HẠN
    if (isExpired) {
        await sendTelegramLog('WARNING', 
            `⛔ <b>KEY HẾT HẠN!</b>\n` +
            `👤 User: ${userData.email}\n` +
            `🔑 Key: <code>${licenseKey}</code>\n` +
            `📅 Hết hạn: ${expiryStr}`
        );
        return NextResponse.json({ valid: false, message: "EXPIRED", expiry: expiryStr });
    }

    // 5. LOGIC KHÓA TÀI KHOẢN (DEVICE LOCK)
    
    // TRƯỜNG HỢP 1: Lần đầu kích hoạt (Chưa có MT5)
    if (currentMT5 === "" || currentMT5 === "0") {
      await usersRef.doc(userId).update({ 
          mt5Account: incomingMT5,
          firstActivatedAt: new Date() // Ghi lại ngày kích hoạt đầu tiên
      });

      await sendTelegramLog('SUCCESS',
        `🚀 <b>KÍCH HOẠT MỚI THÀNH CÔNG!</b>\n` +
        `👤 User: <b>${userData.email || "Ẩn danh"}</b>\n` +
        `🔑 Key: <code>${licenseKey}</code>\n` +
        `📈 MT5 ID: <code>${incomingMT5}</code>\n` +
        `💎 Gói: <b>${userData.plan || "FREE"}</b>`
      );

      return NextResponse.json({ 
          valid: true, 
          message: "ACTIVATED", 
          plan: userData.plan,
          expiry: expiryStr 
      });
    }

    // TRƯỜNG HỢP 2: Sai tài khoản MT5 (Mang Key sang máy khác)
    if (currentMT5 !== incomingMT5) {
      await sendTelegramLog('WARNING',
        `⚠️ <b>CẢNH BÁO: SAI TÀI KHOẢN MT5</b>\n` +
        `🔑 Key: <code>${licenseKey}</code>\n` +
        `🔒 Đã khóa với: <code>${currentMT5}</code>\n` +
        `🚫 Đang cố nhập: <code>${incomingMT5}</code>`
      );
      return NextResponse.json({ 
          valid: false, 
          message: `WRONG ACCOUNT (Locked to: ${currentMT5})` 
      });
    }

    // TRƯỜNG HỢP 3: Hợp lệ (Đăng nhập lại)
    return NextResponse.json({ 
        valid: true, 
        message: "OK", 
        plan: userData.plan,
        expiry: expiryStr
    });

  } catch (error: any) {
    console.error("🔥 SYSTEM ERROR:", error);
    return NextResponse.json({ valid: false, message: "Server Error" }, { status: 500 });
  }
}
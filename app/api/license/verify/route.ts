import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// 🛑 BẮT BUỘC: Đảm bảo API luôn chạy dynamic
export const dynamic = 'force-dynamic';

// 📡 CẤU HÌNH TELEGRAM
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_ID;

// 📨 HÀM GỬI TIN NHẮN
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

    // 2. TRUY VẤN FIRESTORE
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
      await sendTelegramLog('ERROR', `Phát hiện Key lạ: <code>${licenseKey}</code>`);
      return NextResponse.json({ valid: false, message: "INVALID KEY" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Chuẩn hóa dữ liệu đầu vào
    const incomingMT5 = String(mt5Account).trim();
    
    // Lấy thông tin 2 Slot
    const slot1 = userData.mt5Account ? String(userData.mt5Account).trim() : "";
    const slot2 = userData.mt5Account2 ? String(userData.mt5Account2).trim() : "";
    
    const isLifetime = userData.plan === 'LIFETIME';

    // 3. KIỂM TRA HẠN SỬ DỤNG
    let isExpired = false;
    let expiryStr = "LIFETIME";
    
    if (!isLifetime && userData.expiryDate) {
        const now = new Date();
        const expiryDate = userData.expiryDate.toDate();
        expiryStr = expiryDate.toLocaleDateString('vi-VN');
        if (expiryDate < now) isExpired = true;
    }

    if (isExpired) {
        await sendTelegramLog('WARNING', `⛔ <b>KEY HẾT HẠN!</b>\nUser: ${userData.email}\nKey: <code>${licenseKey}</code>`);
        return NextResponse.json({ valid: false, message: "EXPIRED", expiry: expiryStr });
    }

    // 4. LOGIC KHÓA TÀI KHOẢN (MULTI-SLOT)

    // ✅ TRƯỜNG HỢP A: ID KHỚP VỚI SLOT 1 HOẶC SLOT 2 (Đăng nhập lại)
    if (incomingMT5 === slot1 || incomingMT5 === slot2) {
        return NextResponse.json({ 
            valid: true, 
            message: "OK", 
            plan: userData.plan, 
            expiry: expiryStr 
        });
    }

    // ✅ TRƯỜNG HỢP B: SLOT 1 CÒN TRỐNG (Kích hoạt thiết bị 1)
    if (slot1 === "" || slot1 === "0") {
        await usersRef.doc(userId).update({ 
            mt5Account: incomingMT5,
            firstActivatedAt: new Date()
        });

        await sendTelegramLog('SUCCESS',
            `🚀 <b>KÍCH HOẠT SLOT 1!</b>\n` +
            `👤 User: <b>${userData.email}</b>\n` +
            `💎 Gói: <b>${userData.plan}</b>\n` +
            `📈 MT5: <code>${incomingMT5}</code>`
        );

        return NextResponse.json({ valid: true, message: "ACTIVATED SLOT 1", plan: userData.plan, expiry: expiryStr });
    }

    // ✅ TRƯỜNG HỢP C: SLOT 1 ĐÃ FULL, NHƯNG LÀ LIFETIME VÀ SLOT 2 CÒN TRỐNG
    if (isLifetime && (slot2 === "" || slot2 === "0")) {
        await usersRef.doc(userId).update({ 
            mt5Account2: incomingMT5 
        });

        await sendTelegramLog('SUCCESS',
            `🚀 <b>KÍCH HOẠT SLOT 2 (VIP)!</b>\n` +
            `👤 User: <b>${userData.email}</b>\n` +
            `💎 Gói: <b>LIFETIME</b>\n` +
            `📈 MT5 (2): <code>${incomingMT5}</code>`
        );

        return NextResponse.json({ valid: true, message: "ACTIVATED SLOT 2", plan: userData.plan, expiry: expiryStr });
    }

    // ⛔ TRƯỜNG HỢP D: TỪ CHỐI (Sai tài khoản hoặc Hết slot)
    let errorMsg = `WRONG ACCOUNT (Locked to: ${slot1})`;
    if (isLifetime) errorMsg = `DEVICE LIMIT REACHED (Locked to: ${slot1} & ${slot2})`;

    await sendTelegramLog('WARNING',
        `⚠️ <b>CẢNH BÁO: CHẶN ĐĂNG NHẬP</b>\n` +
        `👤 User: ${userData.email}\n` +
        `💎 Gói: ${userData.plan}\n` +
        `🔒 Slot 1: <code>${slot1}</code>\n` +
        (isLifetime ? `🔒 Slot 2: <code>${slot2}</code>\n` : ``) +
        `🚫 Đang cố nhập: <code>${incomingMT5}</code>`
    );

    return NextResponse.json({ valid: false, message: errorMsg });

  } catch (error: any) {
    console.error("🔥 SYSTEM ERROR:", error);
    return NextResponse.json({ valid: false, message: "Server Error" }, { status: 500 });
  }
}
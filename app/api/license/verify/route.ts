import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// 🛑 BẮT BUỘC: Đảm bảo API luôn chạy dynamic (không bị cache)
export const dynamic = 'force-dynamic';

// 📨 HÀM GỬI TIN NHẮN TELEGRAM (Đã chuyển Env vào trong để tránh lỗi Vercel)
async function sendTelegramLog(type: 'SUCCESS' | 'WARNING' | 'ERROR', message: string) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_ID;
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;

  const icon = type === 'SUCCESS' ? '🟢' : type === 'WARNING' ? '⚠️' : '🔴';
  const htmlMsg = `${icon} <b>[LICENSE SYSTEM]</b>\n\n${message}`;

  try {
    fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: htmlMsg,
        parse_mode: "HTML"
      }),
    }).catch(e => console.error("Tele Log Error:", e));
  } catch (e) {}
}

export async function POST(req: Request) {
  try {
    // 1. NHẬN DỮ LIỆU TỪ BOT
    const body = await req.json();
    const { licenseKey, mt5Account } = body;

    if (!licenseKey || !mt5Account) {
      return NextResponse.json({ valid: false, message: "Missing Data" }, { status: 400 });
    }

    // 2. TRUY VẤN FIRESTORE BẰNG ADMIN SDK
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
      sendTelegramLog('ERROR', `Phát hiện Key lạ cố xâm nhập:\n🔑 <code>${licenseKey}</code>\n📈 MT5: <code>${mt5Account}</code>`);
      return NextResponse.json({ valid: false, message: "INVALID KEY" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // 3. XỬ LÝ LOGIC MT5 (ÉP BUỘC ADMIN PHẢI DUYỆT TRƯỚC)
    const currentMT5 = userData.mt5Account ? String(userData.mt5Account).trim() : "";
    const incomingMT5 = String(mt5Account).trim();

    // 🛡️ TRƯỜNG HỢP A: TÀI KHOẢN CHƯA ĐƯỢC ADMIN CẤP SỐ MT5
    // Đã xóa chức năng tự động nhận MT5. Admin phải tự nhập số MT5 cho khách trên Dashboard.
    if (currentMT5 === "" || currentMT5 === "0" || currentMT5 === "undefined") {
        sendTelegramLog('WARNING', 
            `⛔ <b>TỪ CHỐI KÍCH HOẠT</b>\n` +
            `Khách hàng dùng Key: <code>${licenseKey}</code>\n` +
            `Đang cố chạy Bot trên MT5: <code>${incomingMT5}</code>\n` +
            `👉 <i>Vui lòng kiểm tra IB và duyệt MT5 trên Admin Dashboard!</i>`
        );
        return NextResponse.json({ 
            valid: false, 
            message: "Tài khoản chưa được Admin cấp phép (Chưa có số MT5)" 
        });
    }

    // 🛡️ TRƯỜNG HỢP B: SAI SỐ MT5 (Khách cắm Bot sang máy khác)
    if (currentMT5 !== incomingMT5) {
      sendTelegramLog('WARNING',
        `⚠️ <b>CẢNH BÁO: MƯỢN KEY TRÁI PHÉP</b>\n` +
        `👤 User: ${userData.email}\n` +
        `🔒 MT5 Đã Đăng Ký: <code>${currentMT5}</code>\n` +
        `🚫 Đang cố nhập vào MT5: <code>${incomingMT5}</code>`
      );
      return NextResponse.json({ 
          valid: false, 
          message: `WRONG ACCOUNT (Locked to: ${currentMT5})` 
      });
    }

    // 4. KIỂM TRA HẠN SỬ DỤNG (CHỐNG CRASH NGÀY THÁNG)
    let isExpired = false;
    let expiryStr = "LIFETIME";
    
    if (userData.plan !== 'LIFETIME' && userData.expiryDate) {
        const now = new Date();
        const expiryDate = typeof userData.expiryDate.toDate === 'function' 
            ? userData.expiryDate.toDate() 
            : new Date(userData.expiryDate); 
            
        expiryStr = expiryDate.toLocaleDateString('vi-VN');

        if (expiryDate < now) {
            isExpired = true;
        }
    }

    // 🛑 CHẶN NẾU HẾT HẠN
    if (isExpired) {
        sendTelegramLog('WARNING', 
            `⛔ <b>KEY ĐÃ HẾT HẠN!</b>\n` +
            `👤 User: ${userData.email}\n` +
            `🔑 Key: <code>${licenseKey}</code>\n` +
            `📅 Hết hạn: ${expiryStr}`
        );
        return NextResponse.json({ valid: false, message: "EXPIRED", expiry: expiryStr });
    }

    // 5. MỌI THỨ HỢP LỆ -> CHO PHÉP BOT CHẠY
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

// 🛡️ BẮT BUỘC: CHỐNG LỖI CORS KHI GỌI TỪ MQL5
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
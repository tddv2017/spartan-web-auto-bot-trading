import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 
import * as admin from "firebase-admin";

// 🛑 BẮT BUỘC: Không cache để dữ liệu luôn tươi mới
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. NHẬN DỮ LIỆU TỪ MT5
    let { licenseKey, mt5Account, ticket, symbol, type, profit, time } = body;

    if (!licenseKey || !mt5Account) {
      return NextResponse.json({ valid: false, error: 'Key & MT5 Required' }, { status: 400 });
    }

    // 2. XÁC THỰC LICENSE & TÀI KHOẢN (Bảo mật quân đoàn)
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid Key' }, { status: 401 });
    }

    const userData = snapshot.docs[0].data();
    const dbMT5 = String(userData.mt5Account || "").trim();
    const botMT5 = String(mt5Account).trim();

    if (dbMT5 !== botMT5 && dbMT5 !== "") { 
        return NextResponse.json({ valid: false, error: 'Wrong MT5 Account' }, { status: 401 });
    }

    // 3. XỬ LÝ DỮ LIỆU TRƯỚC KHI GHI (XỬ LÝ SAI SỐ)
    
    // Chuẩn hóa Loại lệnh (BUY/SELL)
    let strType = "UNKNOWN";
    const rawType = String(type).toUpperCase();
    if (rawType === "0" || rawType.includes("BUY")) strType = "BUY";
    else if (rawType === "1" || rawType.includes("SELL")) strType = "SELL";

    // 🎯 FIX PROFIT: Ép kiểu số thực cẩn thận để Dashboard tính toán được
    const cleanProfit = Number(parseFloat(String(profit)).toFixed(2)) || 0;

    // 🎯 FIX TICKET: Ép kiểu chuỗi để làm ID Document (Tránh lỗi số nguyên 64-bit của MT5)
    const ticketId = String(ticket);

    // 🎯 FIX TIME: Chuyển đổi Unix Time từ MT5 sang định dạng ISO
    let finalTime = new Date().toISOString();
    if (time) {
        const t = Number(time);
        // MT5 trả về giây (Unix), JS cần mili giây (t * 1000)
        finalTime = new Date(t < 10000000000 ? t * 1000 : t).toISOString();
    }

    // 4. 🔥 GHI VÀO FIREBASE (Cấu trúc: bots -> [MT5] -> trades -> [Ticket])
    if (ticket) {
      const botDocRef = adminDb.collection("bots").doc(botMT5);
      const tradeRef = botDocRef.collection("trades").doc(ticketId);

      // Ghi vào lịch sử lệnh chi tiết (Dùng cho biểu đồ Log)
      await tradeRef.set({
        mt5Account: Number(botMT5),
        licenseKey: licenseKey,
        ticket: ticketId,
        symbol: symbol || "XAUUSD",
        type: strType,
        profit: cleanProfit, 
        time: finalTime,           
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 🔥 ĐỒNG BỘ VÀO DOCUMENT MẸ (Cực kỳ quan trọng để Dashboard hiện số tổng)
      // Chúng ta ghi đè vào realizedProfit để hàm GET bên kia lấy được số chuẩn ngay lập tức
      await botDocRef.set({
          lastTradeTime: finalTime,
          realizedProfit: cleanProfit, // 🎯 ĐÃ ĐỒNG BỘ TÊN BIẾN VỚI HÀM GET
          profit: cleanProfit,         // Dự phòng cho các logic cũ
          lastProfit: cleanProfit,     // Dự phòng thêm
          mt5Account: Number(botMT5),
          status: "RUNNING",
          lastHeartbeat: new Date().toISOString()
      }, { merge: true });

      console.log(`✅ [TRADE SYNC] MT5: ${botMT5} | Ticket: ${ticketId} | Realized PnL: ${cleanProfit}`);
    }

    return NextResponse.json({ 
        valid: true, 
        success: true, 
        message: 'Trade Recorded and Synced Successfully' 
    }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Trade API Error:", error);
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}

// 🛡️ GIỮ NGUYÊN ĐỂ KHÔNG LỖI CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
  } });
}
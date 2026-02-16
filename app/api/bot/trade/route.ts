import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Nhận dữ liệu từ Bot
    let { licenseKey, mt5Account, ticket, symbol, type, profit, time, timestamp } = body;

    // Chuẩn hóa loại lệnh
    let strType = "UNKNOWN";
    const rawType = String(type).toUpperCase();
    if (rawType === "0" || rawType.includes("BUY")) strType = "BUY";
    else if (rawType === "1" || rawType.includes("SELL")) strType = "SELL";

    if (!licenseKey || !mt5Account) {
      return NextResponse.json({ valid: false, error: 'Key & MT5 Required' }, { status: 400 });
    }

    // 2. Vẫn phải check User để đảm bảo Key này là Key thật, MT5 thật
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

    // 3. 🔥 LƯU VÀO COLLECTION 'BOTS' (NGANG HÀNG USER)
    // Đường dẫn: bots -> [MT5_ID] -> trades -> [Ticket_ID]
    if (ticket) {
      const numTicket = Number(ticket);
      
      // Tạo tham chiếu đến đúng đường dẫn mới
      const botDocRef = adminDb.collection("bots").doc(botMT5);
      const tradeRef = botDocRef.collection("trades").doc(String(numTicket));

      // Dữ liệu thời gian
      const finalTime = time || new Date().toISOString(); 
      const finalTimestamp = timestamp || Date.now();

      // Thực hiện ghi dữ liệu
      await tradeRef.set({
        mt5Account: Number(botMT5),
        licenseKey: licenseKey, // Vẫn lưu key để dễ trace nếu cần
        ticket: numTicket,
        symbol: symbol || "XAUUSD",
        type: strType,
        profit: Number(profit) || 0,
        time: finalTime,           
        timestamp: finalTimestamp, 
        updatedAt: new Date()      
      }, { merge: true });

      // (Tùy chọn) Cập nhật timestamp lần cuối hoạt động cho Bot mẹ để biết nó còn sống
      await botDocRef.set({
          lastTradeTime: new Date().toISOString(),
          mt5Account: Number(botMT5) // Đảm bảo document cha tồn tại
      }, { merge: true });
    }

    return NextResponse.json({ valid: true, success: true, message: 'Trade Saved to Bots Collection' }, { status: 200 });

  } catch (error: any) {
    console.error("Trade API Error:", error);
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', } });
}
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Nhận dữ liệu (Quan trọng nhất là TIME từ Bot gửi lên)
    let { licenseKey, mt5Account, ticket, symbol, type, profit, time, timestamp } = body;

    // Chuẩn hóa loại lệnh
    let strType = "UNKNOWN";
    const rawType = String(type).toUpperCase();
    if (rawType === "0" || rawType.includes("BUY")) strType = "BUY";
    else if (rawType === "1" || rawType.includes("SELL")) strType = "SELL";

    // Validate cơ bản
    if (!licenseKey || !mt5Account) {
      return NextResponse.json({ valid: false, error: 'Key & MT5 Required' }, { status: 400 });
    }

    // 2. Xác thực License (Vẫn phải check để đảm bảo bảo mật)
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid Key' }, { status: 401 });
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    // Check MT5 (Chống sai tài khoản)
    const dbMT5 = String(userData.mt5Account || "").trim();
    const botMT5 = String(mt5Account).trim();

    if (dbMT5 !== botMT5 && dbMT5 !== "") { 
        return NextResponse.json({ valid: false, error: 'Wrong MT5 Account' }, { status: 401 });
    }

    // 3. Ghi vào sổ cái (Firestore)
    if (ticket) {
      const numTicket = Number(ticket);
      const tradeRef = adminDb.collection("users").doc(userId).collection("trades").doc(String(numTicket));

      // 🔥 ƯU TIÊN DÙNG THỜI GIAN TỪ BOT (Để vẽ chart đúng quá khứ)
      const finalTime = time || new Date().toISOString(); 
      const finalTimestamp = timestamp || Date.now();

      await tradeRef.set({
        mt5Account: Number(botMT5),
        licenseKey: licenseKey,
        ticket: numTicket,
        symbol: symbol || "XAUUSD",
        type: strType,
        profit: Number(profit) || 0,
        
        // Cặp thông số quan trọng cho Chart
        time: finalTime,           
        timestamp: finalTimestamp, 
        
        updatedAt: new Date()      
      }, { merge: true });
    }

    // 4. Trả về thành công (Không cần gửi kèm remoteCommand nữa)
    return NextResponse.json({ 
        valid: true, 
        success: true, 
        message: 'Trade Recorded' 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Trade API Error:", error);
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', } });
}
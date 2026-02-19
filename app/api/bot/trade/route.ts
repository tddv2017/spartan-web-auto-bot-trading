import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 
import * as admin from "firebase-admin";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. NHẬN DỮ LIỆU TỪ MT5
    let { licenseKey, mt5Account, ticket, symbol, type, profit, time } = body;

    if (!mt5Account || !licenseKey) {
      return NextResponse.json({ valid: false, error: 'Key & MT5 Required' }, { status: 400 });
    }

    // 2. XÁC THỰC LICENSE & TÀI KHOẢN
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid Key' }, { status: 401 });
    }

    const userData = snapshot.docs[0].data();
    const botMT5 = String(mt5Account).trim();

    if (String(userData.mt5Account).trim() !== botMT5 && String(userData.mt5Account).trim() !== "") { 
        return NextResponse.json({ valid: false, error: 'Wrong MT5 Account' }, { status: 401 });
    }

    // 3. XỬ LÝ DỮ LIỆU CHỐNG SAI SỐ (FIX PROFIT = 0)
    
    let strType = "UNKNOWN";
    const rawType = String(type).toUpperCase();
    if (rawType === "0" || rawType.includes("BUY")) strType = "BUY";
    else if (rawType === "1" || rawType.includes("SELL")) strType = "SELL";

    // 🎯 Ép kiểu số thực và làm tròn 2 chữ số (Quan trọng để Firebase tính toán)
    const cleanProfit = Number(parseFloat(String(profit)).toFixed(2));
    const ticketId = String(ticket);

    let finalTime = new Date().toISOString();
    if (time) {
        const t = Number(time);
        finalTime = new Date(t < 10000000000 ? t * 1000 : t).toISOString();
    }

    // 4. 🔥 THỰC THI GHI DỮ LIỆU ĐỒNG BỘ
    if (ticket) {
      const ticketId = String(ticket);
      const botDocRef = adminDb.collection("bots").doc(botMT5);
      const tradeRef = botDocRef.collection("trades").doc(ticketId);
      const cleanProfit = Number(parseFloat(String(profit)).toFixed(2));

      // 1. Lưu lịch sử (Trades History)
      await tradeRef.set({
        ticket: ticketId,
        symbol: symbol || "XAUUSD",
        type: strType,
        profit: cleanProfit, // Lưu số lãi thực vào đây
        time: finalTime,           
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 2. Cập nhật Last Profit cho Document mẹ
      await botDocRef.set({
          lastProfit: cleanProfit, // 🔥 ĐÃ THÔNG: Chỉ lưu số của lệnh vừa đóng
          realizedProfit: admin.firestore.FieldValue.increment(cleanProfit), // Cộng dồn
          lastTradeTime: finalTime
      }, { merge: true });
    }

    return NextResponse.json({ 
        valid: true, 
        success: true, 
        message: 'Trade Recorded and Incremented Successfully' 
    }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Trade API Error:", error);
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
  } });
}
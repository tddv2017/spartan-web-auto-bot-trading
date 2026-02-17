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
      const botDocRef = adminDb.collection("bots").doc(botMT5);
      const tradeRef = botDocRef.collection("trades").doc(ticketId);

      // A. Ghi vào Lịch sử lệnh chi tiết (Sub-collection)
      await tradeRef.set({
        mt5Account: Number(botMT5),
        ticket: ticketId,
        symbol: symbol || "XAUUSD",
        type: strType,
        profit: cleanProfit, // 🔥 ĐÃ FIX: Lưu đúng số lãi của riêng ticket này
        time: finalTime,           
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // B. Cập nhật Document mẹ (Hạch toán tổng lực)
      await botDocRef.set({
          lastTradeTime: finalTime,
          // 🔥 QUAN TRỌNG: lastProfit chỉ lưu số của lệnh VỪA đóng
          lastProfit: cleanProfit, 
          // 🔥 QUAN TRỌNG: realizedProfit sẽ tự cộng dồn lãi mới vào lãi cũ
          realizedProfit: admin.firestore.FieldValue.increment(cleanProfit),
          profit: cleanProfit, // Giữ để tương thích Dashboard cũ
          mt5Account: Number(botMT5),
          status: "RUNNING",
          lastHeartbeat: new Date().toISOString()
      }, { merge: true });

      console.log(`✅ [TRADE SYNC] MT5: ${botMT5} | Ticket: ${ticketId} | LastProfit: ${cleanProfit}`);
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
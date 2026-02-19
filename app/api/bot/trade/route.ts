import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 
import * as admin from "firebase-admin";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. NHẬN DỮ LIỆU TỪ PYTHON (BỔ SUNG totalProfit)
    let { licenseKey, mt5Account, ticket, symbol, type, profit, totalProfit, time } = body;

    if (!mt5Account || !licenseKey || !ticket) {
      return NextResponse.json({ valid: false, error: 'Key, MT5 & Ticket Required' }, { status: 400 });
    }

    // 2. XÁC THỰC LICENSE & TÀI KHOẢN
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid Key' }, { status: 401 });
    }

    const userData = snapshot.docs[0].data();
    const botMT5 = String(mt5Account).trim();

    // Logic: Nếu user đã bind MT5 thì phải khớp, chưa bind ("") thì cho qua
    if (userData.mt5Account && String(userData.mt5Account).trim() !== botMT5 && String(userData.mt5Account).trim() !== "") { 
        return NextResponse.json({ valid: false, error: 'Wrong MT5 Account' }, { status: 401 });
    }

    // 3. XỬ LÝ DỮ LIỆU CHỐNG SAI SỐ
    
    // A. Xử lý Type (BUY/SELL)
    let strType = "UNKNOWN";
    const rawType = String(type).toUpperCase();
    if (rawType === "0" || rawType.includes("BUY")) strType = "BUY";
    else if (rawType === "1" || rawType.includes("SELL")) strType = "SELL";

    // B. Xử lý Profit (Ưu tiên TotalProfit để tính đúng tiền thực nhận)
    // Nếu Python gửi totalProfit (lãi + swap + com) thì dùng, không thì dùng profit thường
    const rawProfit = (totalProfit !== undefined && totalProfit !== null) ? totalProfit : profit;
    const cleanProfit = Number(parseFloat(String(rawProfit)).toFixed(2));
    
    const ticketId = String(ticket);

    // C. 🔥 XỬ LÝ TIME ĐA NĂNG (SỬA LỖI INVALID TIME) 🔥
    let tradeDate = new Date(); // Mặc định là giờ Server hiện tại
    
    if (time) {
        // Kiểm tra nếu là chuỗi ISO (VD: "2026-02-19T...")
        if (typeof time === 'string' && (time.includes('T') || time.includes('-'))) {
            const parsed = new Date(time);
            if (!isNaN(parsed.getTime())) tradeDate = parsed;
        } 
        // Kiểm tra nếu là số Timestamp (Unix epoch)
        else {
            const t = Number(time);
            if (!isNaN(t)) {
                // Tự động nhận diện giây (10 số) hay mili-giây (13 số)
                tradeDate = new Date(t < 10000000000 ? t * 1000 : t);
            }
        }
    }
    
    // Chuyển về chuỗi ISO chuẩn để lưu DB
    const finalTime = tradeDate.toISOString();

    // 4. 🔥 THỰC THI GHI DỮ LIỆU ĐỒNG BỘ
    const botDocRef = adminDb.collection("bots").doc(botMT5);
    const tradeRef = botDocRef.collection("trades").doc(ticketId);

    // Nhiệm vụ 1: Lưu lịch sử chi tiết (Trades History)
    await tradeRef.set({
        ticket: ticketId,
        symbol: symbol || "XAUUSD",
        type: strType,
        profit: cleanProfit, // Số tiền thực nhận
        time: finalTime,     // Chuỗi thời gian chuẩn ISO
        timestamp: admin.firestore.Timestamp.fromDate(tradeDate) // Timestamp chuẩn để sort
    }, { merge: true });

    // Nhiệm vụ 2: Cập nhật Dashboard (Cộng dồn tiền)
    await botDocRef.set({
          lastProfit: cleanProfit, // Chỉ lưu số của lệnh vừa đóng
          realizedProfit: admin.firestore.FieldValue.increment(cleanProfit), // Cộng dồn
          lastTradeTime: finalTime,
          mt5Account: botMT5 // Đảm bảo document tồn tại
    }, { merge: true });

    return NextResponse.json({ 
        valid: true, 
        success: true, 
        message: `Trade ${ticketId} Recorded (${cleanProfit}$)` 
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
import { NextResponse } from 'next/server';
// ⚠️ Thay ../../ bằng @/ nếu Next.js có hỗ trợ, nếu không giữ nguyên nhưng nhớ kiểm tra kỹ
import { db } from '@/lib/firebase'; 
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { licenseKey, ticket, symbol, type, profit } = body;

    // 1. CHUẨN HÓA DỮ LIỆU ĐẦU VÀO (FIX LỖI 0 vs "BUY")
    // Chuyển đổi type từ số sang chữ cho dễ đọc trên Database
    // MT5: 0=Buy, 1=Sell. Nếu nhận được chuỗi "BUY"/"SELL" rồi thì giữ nguyên.
    let strType = "UNKNOWN";
    if (type === 0 || type === "0" || type === "BUY") strType = "BUY";
    else if (type === 1 || type === "1" || type === "SELL") strType = "SELL";

    if (!licenseKey) {
      return NextResponse.json({ valid: false, error: 'Key Required' }, { status: 400 });
    }

    // 2. Tìm User
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("licenseKey", "==", licenseKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid Key' }, { status: 401 });
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // 3. Lưu lệnh trade
    if (ticket) {
      const tradesRef = collection(db, "users", userId, "trades");
      
      // Ép kiểu ticket sang Number để tìm kiếm chính xác
      const numTicket = Number(ticket);
      
      const tradeQuery = query(tradesRef, where("ticket", "==", numTicket));
      const tradeSnap = await getDocs(tradeQuery);

      if (tradeSnap.empty) {
        await addDoc(tradesRef, {
          ticket: numTicket, // Lưu thống nhất là số
          symbol: symbol || "XAUUSD",
          type: strType,     // Lưu thống nhất là "BUY" hoặc "SELL"
          profit: Number(profit) || 0,
          closeTime: new Date().toISOString(),
          createdAt: serverTimestamp()
        });
        console.log(`✅ Synced Trade #${ticket} for User ${userId}`);
      }
    }

    return NextResponse.json({ 
      valid: true, 
      success: true,
      message: 'Spartan: Synced' 
    }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Sync Error:", error);
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}

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
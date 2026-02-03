import { NextResponse } from 'next/server';
// ⚠️ Đại tá kiểm tra lại đường dẫn import này cho đúng với máy mình nhé
import { db } from '../../lib/firebase'; 
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 👇 Lấy dữ liệu từ Bot gửi lên
    let { licenseKey, mt5Account, ticket, symbol, type, profit } = body;

    // 1. CHUẨN HÓA DỮ LIỆU (FIX LỖI 0 vs "BUY")
    let strType = "UNKNOWN";
    if (type === 0 || type === "0" || type === "BUY") strType = "BUY";
    else if (type === 1 || type === "1" || type === "SELL") strType = "SELL";

    if (!licenseKey) {
      return NextResponse.json({ valid: false, error: 'Key Required' }, { status: 400 });
    }

    // 2. TÌM USER ID DỰA TRÊN LICENSE KEY (Đoạn này quan trọng để có userId)
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("licenseKey", "==", licenseKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid Key' }, { status: 401 });
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id; // ✅ ĐÂY LÀ DÒNG KHAI BÁO USERID (Sẽ hết lỗi đỏ)

    // 3. LƯU LỆNH TRADE
    if (ticket) {
      const tradesRef = collection(db, "users", userId, "trades");
      
      // Ép kiểu ticket sang Number để tìm kiếm chính xác
      const numTicket = Number(ticket);
      
      // Kiểm tra trùng lệnh (Duplicate check)
      const tradeQuery = query(tradesRef, where("ticket", "==", numTicket));
      const tradeSnap = await getDocs(tradeQuery);

      if (tradeSnap.empty) {
        await addDoc(tradesRef, {
          mt5Account: Number(mt5Account), // ✅ Lưu số TK MT5
          licenseKey: licenseKey,         // ✅ Lưu License Key
          ticket: numTicket,
          symbol: symbol || "XAUUSD",
          type: strType,
          profit: Number(profit) || 0,
          closeTime: new Date().toISOString(),
          createdAt: serverTimestamp()
        });
        console.log(`✅ Synced Trade #${ticket} | MT5: ${mt5Account}`);
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

// Hàm hỗ trợ CORS
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
import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase'; 
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// 🛡️ HÀM XỬ LÝ CHÍNH (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseKey, ticket, symbol, type, profit } = body;

    if (!licenseKey) {
      return NextResponse.json({ valid: false, error: 'Key Required' }, { status: 400 });
    }

    // Tìm User
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("licenseKey", "==", licenseKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid Key' }, { status: 401 });
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Lưu lệnh trade
    if (ticket) {
      const tradesRef = collection(db, "users", userId, "trades");
      const tradeQuery = query(tradesRef, where("ticket", "==", ticket));
      const tradeSnap = await getDocs(tradeQuery);

      if (tradeSnap.empty) {
        await addDoc(tradesRef, {
          ticket: ticket,
          symbol: symbol || "XAUUSD",
          type: type || "BUY",
          profit: Number(profit) || 0,
          closeTime: new Date().toISOString(),
          createdAt: serverTimestamp()
        });
      }
    }

    // ✅ PHẢN HỒI CHO BOT (Rất quan trọng để g_IsAuthenticated = true)
    return NextResponse.json({ 
      valid: true, 
      success: true,
      message: 'Spartan: Received' 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Firebase Sync Error:", error);
    return NextResponse.json({ valid: false, error: 'Server Error' }, { status: 500 });
  }
}

// 🌐 HÀM HỖ TRỢ (OPTIONS) - Giúp fix lỗi 405/CORS
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
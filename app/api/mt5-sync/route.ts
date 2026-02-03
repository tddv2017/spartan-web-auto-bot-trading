import { NextResponse } from 'next/server';

// ⚠️ QUAN TRỌNG: Dùng @ để trỏ về thư mục gốc. 
// Nếu file lib nằm ở root/lib/firebase.ts thì @/lib/firebase là chuẩn nhất.
import { db } from '@/lib/firebase'; 
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  console.log("🚀 [API] Đã nhận tín hiệu từ Bot...");

  // 🛡️ CHECK 1: Kiểm tra xem chìa khóa môi trường có tồn tại không
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("❌ LỖI  Server không thấy biến môi trường!");
    return NextResponse.json({ valid: false, error: 'Server Missing Env Vars' }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.log("📦 [DATA] Body nhận được:", JSON.stringify(body));

    let { licenseKey, mt5Account, ticket, symbol, type, profit } = body;

    // Chuẩn hóa dữ liệu
    let strType = "UNKNOWN";
    if (type === 0 || type === "0" || type === "BUY") strType = "BUY";
    else if (type === 1 || type === "1" || type === "SELL") strType = "SELL";

    if (!licenseKey) {
      console.warn("⚠️ [WARN] Thiếu License Key");
      return NextResponse.json({ valid: false, error: 'Key Required' }, { status: 400 });
    }

    // Tìm User
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("licenseKey", "==", licenseKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`⚠️ [WARN] Không tìm thấy User với Key: ${licenseKey}`);
      return NextResponse.json({ valid: false, error: 'Invalid Key' }, { status: 401 });
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    console.log(`✅ [AUTH] Xác thực thành công. UserID: ${userId}`);

    // Lưu Trade
    if (ticket) {
      const tradesRef = collection(db, "users", userId, "trades");
      const numTicket = Number(ticket);
      const tradeQuery = query(tradesRef, where("ticket", "==", numTicket));
      const tradeSnap = await getDocs(tradeQuery);

      if (tradeSnap.empty) {
        await addDoc(tradesRef, {
          mt5Account: Number(mt5Account),
          licenseKey: licenseKey,
          ticket: numTicket,
          symbol: symbol || "XAUUSD",
          type: strType,
          profit: Number(profit) || 0,
          closeTime: new Date().toISOString(),
          createdAt: serverTimestamp()
        });
        console.log(`💾 [SAVE] Đã lưu lệnh #${numTicket}`);
      } else {
        console.log(`♻️ [SKIP] Lệnh #${numTicket} đã tồn tại.`);
      }
    }

    return NextResponse.json({ valid: true, success: true, message: 'Spartan: Synced' }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 [CRITICAL ERROR]:", error);
    // Trả về lỗi chi tiết để Đại tá đọc được trên Bot
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
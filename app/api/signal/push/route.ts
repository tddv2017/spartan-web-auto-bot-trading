import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Đảm bảo đường dẫn này đúng tới file config firebase của Đại tá
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Cho phép phương thức POST
export async function POST(req: Request) {
  try {
    // 1. Đọc dữ liệu từ MT5 gửi lên
    const body = await req.json();

    // Log ra để debug trên Vercel (Xem trong tab Logs của Vercel)
    console.log("📨 Nhận tín hiệu từ MT5:", body);

    // 2. Validate (Kiểm tra dữ liệu đầu vào)
    if (!body.symbol || !body.price || !body.type) {
      return NextResponse.json(
        { message: 'Thiếu thông tin quan trọng (symbol, price, type)' },
        { status: 400 }
      );
    }

    // 3. Ghi vào Firestore (Database)
    const docRef = await addDoc(collection(db, "signals"), {
      symbol: body.symbol,
      type: body.type,          // Ví dụ: BUY_BREAKOUT
      price: Number(body.price),
      sl: Number(body.sl || 0),
      tp: Number(body.tp || 0),
      time: body.time,          // Thời gian từ MT5
      createdAt: serverTimestamp() // Thời gian thực của Server
    });

    console.log("✅ Đã lưu vào DB với ID:", docRef.id);

    // 4. Trả về thành công (Code 200)
    return NextResponse.json(
      { success: true, id: docRef.id, message: "Signal Received & Saved" },
      { status: 200 }
    );

  } catch (error: any) {
    // 💥 NẾU CÓ LỖI, BÁO NGAY RA NGOÀI
    console.error("❌ LỖI SERVER:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 } // Đây chính là cái lỗi 500 Đại tá vừa gặp
    );
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Đảm bảo đường dẫn này đúng
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 🛡️ 1. LÍNH GÁC CỔNG: KIỂM TRA MẬT KHẨU API (QUAN TRỌNG)
    const secret = req.headers.get("x-api-secret");
    
    // So sánh mật khẩu gửi lên từ MT5 với mật khẩu trong file .env.local
    // Nếu không khớp hoặc không có -> ĐÁ VĂNG NGAY (Lỗi 401)
    if (secret !== process.env.API_SECRET_KEY) {
      console.warn("⛔ PHÁT HIỆN XÂM NHẬP: Sai mật khẩu API hoặc thiếu Key!");
      return NextResponse.json(
        { success: false, message: "CÚT RA NGOÀI! (Unauthorized Access)" },
        { status: 401 }
      );
    }

    // ✅ NẾU MẬT KHẨU ĐÚNG -> TIẾP TỤC XỬ LÝ NHƯ CŨ
    const body = await req.json();

    // Log ra để debug
    console.log("📨 Nhận tín hiệu từ MT5 (Auth OK):", body);

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
      type: body.type,          
      price: Number(body.price),
      sl: Number(body.sl || 0),
      tp: Number(body.tp || 0),
      time: body.time,          
      createdAt: serverTimestamp() 
    });

    console.log("✅ Đã lưu vào DB với ID:", docRef.id);

    // 4. Trả về thành công
    return NextResponse.json(
      { success: true, id: docRef.id, message: "Signal Received & Saved" },
      { status: 200 }
    );

  } catch (error: any) {
    // 💥 NẾU CÓ LỖI SERVER
    console.error("❌ LỖI SERVER:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
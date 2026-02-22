import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Đảm bảo đường dẫn này đúng
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 🛡️ 1. LÍNH GÁC CỔNG: KIỂM TRA MẬT KHẨU API (GIỮ NGUYÊN)
    const secret = req.headers.get("x-api-secret");
    
    // So sánh mật khẩu gửi lên với mật khẩu trong file .env.local
    if (secret !== process.env.API_SECRET_KEY) {
      console.warn("⛔ PHÁT HIỆN XÂM NHẬP: Sai mật khẩu API hoặc thiếu Key!");
      return NextResponse.json(
        { success: false, message: "CÚT RA NGOÀI! (Unauthorized Access)" },
        { status: 401 }
      );
    }

    // ✅ NẾU MẬT KHẨU ĐÚNG -> TIẾP TỤC XỬ LÝ NHƯ CŨ
    const body = await req.json();

    console.log("📨 Nhận tín hiệu chiến thuật (Auth OK):", body);

    // 2. Validate (Kiểm tra dữ liệu đầu vào cơ bản)
    if (!body.symbol || !body.price || !body.type) {
      return NextResponse.json(
        { message: 'Thiếu thông tin quan trọng (symbol, price, type)' },
        { status: 400 }
      );
    }

    // 3. Ghi vào Firestore (Database) - HỢP NHẤT CŨ VÀ MỚI
    const docRef = await addDoc(collection(db, "signals"), {
      // --- NHIỆM VỤ CŨ (Thông số kỹ thuật lệnh) ---
      symbol: body.symbol,
      type: body.type,          
      price: Number(body.price),
      sl: Number(body.sl || 0),
      tp: Number(body.tp || 0),
      time: body.time || new Date().toISOString(),
      
      // --- 🔥 NHIỆM VỤ MỚI (Tình báo Blackbox & Định danh) ---
      licenseKey: body.licenseKey || body.license || "UNKNOWN",
      mt5Account: body.mt5Account || "UNKNOWN",
      reasoning: body.reasoning || "Đang phân tích cấu trúc thị trường...",
      confidence: Number(body.confidence || 0),
      risk: body.risk || "STABLE",

      // Đóng dấu thời gian máy chủ
      createdAt: serverTimestamp() 
    });

    console.log("✅ Đã lưu tín hiệu vào DB với ID:", docRef.id);

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
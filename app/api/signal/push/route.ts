import { NextResponse } from 'next/server';

// 🎯 DÒNG 3: TRỎ VÀO ĐÚNG KHO ĐẠN ADMIN CỦA ĐẠI TÁ
// (Ví dụ: '@/lib/firebase-admin' hoặc '@/lib/admin' tuỳ ngài đặt tên)
import { adminDb } from '@/lib/firebaseAdmin'; 
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 🛡️ 1. LÍNH GÁC CỔNG: BẢO VỆ API BẰNG MẬT KHẨU
    const secret = req.headers.get("x-api-secret");
    if (secret !== process.env.API_SECRET_KEY) {
      console.warn("⛔ TỪ CHỐI KHÁCH KHÔNG MỜI: Sai mật khẩu!");
      return NextResponse.json(
        { success: false, message: "CÚT RA NGOÀI! (Unauthorized Access)" },
        { status: 401 }
      );
    }

    // Nhận kiện hàng từ Python
    const body = await req.json();
    console.log("📨 Nhận tín hiệu từ MT5 (Auth OK):", body);

    // 🛠️ 2. KIỂM DUYỆT HÀNG HÓA (Đã bỏ bẫy số 0)
    if (!body.symbol || body.price === undefined || !body.type) {
      return NextResponse.json(
        { 
          message: 'Thiếu thông tin quan trọng (symbol, price, type)',
          received_data: body 
        },
        { status: 400 }
      );
    }

    // 🚀 3. ĐẠP CỬA FIREBASE BẰNG QUYỀN ADMIN (Bypass 100% Rules)
    const docRef = await adminDb.collection("signals").add({
      symbol: body.symbol,
      type: body.type,          
      price: Number(body.price),
      sl: Number(body.sl || 0),
      tp: Number(body.tp || 0),
      time: body.time || new Date().toISOString(),
      
      // Thông tin tình báo Blackbox
      licenseKey: body.licenseKey || body.license || "UNKNOWN",
      mt5Account: body.mt5Account || "UNKNOWN",
      reasoning: body.reasoning || "Không có giải trình",
      confidence: Number(body.confidence || 0),
      risk: body.risk || "STABLE",

      // Đóng dấu thời gian bằng Server Admin
      createdAt: FieldValue.serverTimestamp() 
    });

    console.log("✅ [ADMIN SUCCESS] Đã lưu vào DB với ID:", docRef.id);

    // 4. GỬI BÁO CÁO THÀNH CÔNG VỀ PYTHON
    return NextResponse.json(
      { success: true, id: docRef.id, message: "OK" },
      { status: 200 }
    );

  } catch (error: any) {
    // 💥 NẾU CÓ LỖI CHẾT NGƯỜI
    console.error("❌ [LỖI TƯỚNG QUÂN]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
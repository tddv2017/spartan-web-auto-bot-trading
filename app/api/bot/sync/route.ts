import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const data = await req.json(); 
    // Data nhận: { licenseKey, mt5Account, botName, balance, equity, floatingProfit... }

    const { licenseKey, mt5Account } = data;

    // 1. CHỐNG SPAM RÁC (Check đủ dữ liệu)
    if (!mt5Account || !licenseKey) {
        console.warn("⚠️ [SYNC FAIL] Thiếu MT5 ID hoặc License Key");
        return NextResponse.json({ valid: false, success: false, error: 'Missing Info' }, { status: 400 });
    }

    const mt5Id = String(mt5Account);

    // 🛡️ 2. CHỐT CHẶN AN NINH CẤP CAO (Cross-Check)
    // Phải kiểm tra xem Key này có khớp với số MT5 đã đăng ký trên hệ thống không!
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef
        .where("licenseKey", "==", licenseKey)
        .where("mt5Account", "==", mt5Id)
        .limit(1)
        .get();

    if (snapshot.empty) {
        console.warn(`⛔ [BLOCK] MT5: ${mt5Id} cố tình Sync nhưng SAI KEY! (Hack detected)`);
        // Trả về valid: false để lỡ con Bot có đọc được thì tự khóa nó lại
        return NextResponse.json({ valid: false, success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // (Tùy chọn nâng cao: Ngài có thể check thêm snapshot.docs[0].data().accountStatus == 'active' 
    // để chặn bot báo cáo nếu user đã hết hạn gói cước)

    // 🔥 3. CẬP NHẬT TRẠNG THÁI (HEARTBEAT) VÀO BẢNG 'bots'
    await adminDb.collection('bots').doc(mt5Id).set({
      ...data,
      mt5Account: Number(mt5Account), // Ép kiểu số cho chắc
      lastHeartbeat: new Date().toISOString(), // 👈 Lấy giờ máy chủ Web, không tin giờ của Bot
      updatedAt: new Date()
    }, { merge: true });

    // Trả về valid: true để Bot MQL5 yên tâm công tác
    return NextResponse.json({ valid: true, success: true }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 [SYNC ERROR]:", error.message);
    return NextResponse.json({ valid: false, success: false }, { status: 500 });
  }
}

// Giữ lại OPTIONS để chống lỗi CORS khi Bot MQL5 gọi API
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
import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// 🛑 BẮT BUỘC: Không cache để dữ liệu luôn tươi mới
export const dynamic = 'force-dynamic';

// ==============================================================================
// 👇 PHẦN MỚI THÊM VÀO: HÀM GET (ĐỂ DASHBOARD SOI DỮ LIỆU)
// ==============================================================================
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const mt5Account = searchParams.get("mt5Account");

        if (!mt5Account) {
            return NextResponse.json({ message: "Thiếu số MT5" }, { status: 400 });
        }

        // 1. LẤY THÔNG TIN TRẠNG THÁI BOT (Heartbeat & Balance) TỪ COLLECTION 'BOTS'
        // Vì hàm POST bên dưới lưu vào 'bots', nên ta lấy ra từ 'bots' luôn cho chuẩn
        const botDocRef = adminDb.collection("bots").doc(mt5Account);
        const botSnap = await botDocRef.get();

        let accountInfo = { balance: 0, equity: 0, profit: 0, status: "OFFLINE" };
        
        if (botSnap.exists) {
            const data = botSnap.data() || {};
            accountInfo = {
                balance: data.balance || 0,
                equity: data.equity || 0,
                profit: data.floatingProfit || 0, // Lấy lợi nhuận thả nổi (Floating PnL)
                status: data.status || "UNKNOWN"
            };
        }

        // 2. LẤY LỊCH SỬ GIAO DỊCH (TRADE HISTORY)
        // Đường dẫn: bots -> [MT5] -> trades (Sub-collection)
        const tradesRef = botDocRef.collection("trades");
        
        // Lấy 50 lệnh mới nhất để vẽ biểu đồ
        const tradesSnap = await tradesRef.orderBy("time", "desc").limit(50).get();

        const trades = tradesSnap.docs.map(doc => {
            const d = doc.data();
            return {
                ticket: d.ticket,
                symbol: d.symbol,
                type: d.type,     // BUY/SELL
                profit: d.profit,
                time: d.time      // Thời gian đóng lệnh
            };
        });

        // 3. TRẢ VỀ GÓI TIN TỔNG HỢP CHO WAR ROOM
        return NextResponse.json({
            accountInfo: accountInfo,
            trades: trades
        });

    } catch (error: any) {
        console.error("🔥 Lỗi GET Sync:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ==============================================================================
// 👇 PHẦN CŨ (GIỮ NGUYÊN 100%): HÀM POST (NHẬN TIN TỪ BOT PYTHON)
// ==============================================================================
export async function POST(req: Request) {
  try {
    const data = await req.json(); 
    const { licenseKey, mt5Account } = data;

    if (!mt5Account || !licenseKey) {
        return NextResponse.json({ valid: false, success: false, error: 'Missing Info' }, { status: 400 });
    }

    // 1. Tìm thông tin User qua License Key
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    // Trường hợp Key bị xóa hoặc đổi thành STOP
    if (snapshot.empty) {
        return NextResponse.json({ 
            valid: false, 
            remoteCommand: "STOP_IMMEDIATELY", 
            error: 'UNAUTHORIZED' 
        }, { status: 401 });
    }

    const userData = snapshot.docs[0].data();
    const dbMT5 = String(userData.mt5Account || "").trim();
    const botMT5 = String(mt5Account).trim();

    // Kiểm tra khớp số tài khoản MT5
    if (dbMT5 !== botMT5) {
        return NextResponse.json({ valid: false, error: 'Wrong MT5' }, { status: 401 });
    }

    // 2. XÁC ĐỊNH LỆNH ĐIỀU KHIỂN
    // Nếu remoteCommand trên Web là "PAUSE", ta gửi lệnh PAUSE xuống Bot
    const isPaused = userData.remoteCommand === "PAUSE";

    // 3. Cập nhật Heartbeat để Dashboard Web báo Online
    await adminDb.collection('bots').doc(botMT5).set({
      ...data,
      mt5Account: Number(botMT5),
      lastHeartbeat: new Date().toISOString(),
      status: isPaused ? "PAUSED" : "RUNNING"
    }, { merge: true });

    // 4. TRẢ VỀ PHẢN HỒI CHO BOT
    return NextResponse.json({ 
        valid: true, 
        success: true, 
        remoteCommand: isPaused ? "PAUSE" : "RUN" 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

// ==============================================================================
// 👇 HÀM OPTIONS (GIỮ NGUYÊN ĐỂ KHÔNG BỊ LỖI CORS)
// ==============================================================================
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Thêm GET vào đây cho chắc
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
  } });
}
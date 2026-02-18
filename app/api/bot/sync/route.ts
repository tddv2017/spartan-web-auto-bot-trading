import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// ==============================================================================
// 👇 HÀM GET: LẤY DỮ LIỆU ĐỂ HIỂN THỊ CHI TIẾT BOT (KHI CLICK VÀO HÀNG)
// ==============================================================================
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const mt5Account = searchParams.get("mt5Account");

        if (!mt5Account) {
            return NextResponse.json({ message: "Thiếu số MT5" }, { status: 400 });
        }

        const botDocRef = adminDb.collection("bots").doc(mt5Account);
        const botSnap = await botDocRef.get();

        let accountInfo = { 
            botName: "Unknown Bot",
            balance: 0, 
            equity: 0, 
            floatingProfit: 0, 
            realizedProfit: 0, // Frontend sẽ map vào đây hoặc trường profit
            profit: 0,         // Trường chuẩn
            symbol: "UNK",
            status: "OFFLINE" 
        };
        
        if (botSnap.exists) {
            const data = botSnap.data() || {};
            accountInfo = {
                botName: data.botName || "Spartan AI",
                symbol: data.symbol || "UNK", // 🔥 Lấy Symbol ra
                balance: data.balance || 0,
                equity: data.equity || 0,
                floatingProfit: data.floatingProfit || 0, 
                
                // 🔥 Ưu tiên lấy trường 'profit' mới nhất từ DB
                profit: data.profit !== undefined ? data.profit : (data.realizedProfit || 0),
                realizedProfit: data.profit !== undefined ? data.profit : (data.realizedProfit || 0),
                
                status: data.status || "UNKNOWN"
            };
        }

        // Lấy lịch sử giao dịch (nếu có)
        const tradesRef = botDocRef.collection("trades");
        const tradesSnap = await tradesRef.orderBy("time", "desc").limit(50).get();

        const trades = tradesSnap.docs.map(doc => {
            const d = doc.data();
            return {
                ticket: d.ticket,
                symbol: d.symbol,
                type: d.type,
                profit: Number(d.profit) || 0,
                time: d.time
            };
        });

        return NextResponse.json({ accountInfo, trades });

    } catch (error: any) {
        console.error("🔥 Lỗi GET Sync:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ==============================================================================
// 👇 HÀM POST: NHẬN HEARTBEAT TỪ BOT (CẬP NHẬT PROFIT VÀO DB)
// ==============================================================================
export async function POST(req: Request) {
  try {
    const data = await req.json(); 
    
    // 🔥 Destructuring lấy toàn bộ dữ liệu quan trọng
    const { 
        licenseKey, 
        mt5Account, 
        botName, 
        balance, 
        equity, 
        floatingProfit, 
        profit, // <--- Lợi nhuận đã chốt
        symbol, // <--- Cặp tiền (XAUUSD...)
        status 
    } = data;

    if (!mt5Account || !licenseKey) {
        return NextResponse.json({ valid: false, error: 'Missing Info' }, { status: 400 });
    }

    // 1. Kiểm tra License (Xác thực quân nhân)
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
        // License sai -> Ra lệnh tự hủy
        return NextResponse.json({ 
            valid: false, 
            remoteCommand: "STOP_IMMEDIATELY", 
            error: 'UNAUTHORIZED' 
        }, { status: 401 });
    }

    const userData = snapshot.docs[0].data();
    const botMT5 = String(mt5Account).trim();
    const isPaused = userData.remoteCommand === "PAUSE";

    // 🎯 2. CẬP NHẬT FIRESTORE (LƯU ĐẦY ĐỦ THÔNG TIN)
    await adminDb.collection('bots').doc(botMT5).set({
        mt5Account: Number(botMT5),
        botName: botName || "Spartan AI",
        
        // 🔥 Cập nhật các chỉ số tài chính
        balance: Number(balance) || 0,
        equity: Number(equity) || 0,
        floatingProfit: Number(floatingProfit) || 0,
        
        // 🔥 QUAN TRỌNG: LƯU TRƯỜNG PROFIT (NET REALIZED)
        // Kiểm tra undefined để tránh lỗi nếu gói tin bị thiếu
        profit: profit !== undefined ? Number(profit) : 0,

        // 🔥 LƯU SYMBOL (Cặp tiền)
        symbol: symbol || "UNK",

        lastHeartbeat: new Date().toISOString(),
        
        // Status: Ưu tiên lệnh từ Server (PAUSE) đè lên status của Bot gửi
        status: isPaused ? "PAUSED" : (status || "RUNNING")
        
    }, { merge: true }); // Merge true: Chỉ cập nhật trường thay đổi, giữ lại lịch sử khác

    // 3. Phản hồi lại cho Bot (Ra lệnh điều khiển)
    return NextResponse.json({ 
        valid: true, 
        success: true, 
        remoteCommand: isPaused ? "PAUSE" : "RUN" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Lỗi POST Sync:", error);
    return NextResponse.json({ valid: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Hàm OPTIONS để xử lý CORS (nếu gọi từ domain khác)
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
  } });
}
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
            realizedProfit: 0, 
            status: "OFFLINE" 
        };
        
        if (botSnap.exists) {
            const data = botSnap.data() || {};
            accountInfo = {
                botName: data.botName || "Spartan AI",
                balance: data.balance || 0,
                equity: data.equity || 0,
                floatingProfit: data.floatingProfit || 0, 
                // 🔥 Ưu tiên lấy trường 'profit' mới nhất
                realizedProfit: data.profit !== undefined ? data.profit : (data.realizedProfit || 0), 
                status: data.status || "UNKNOWN"
            };
        }

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
    const { licenseKey, mt5Account, botName } = data;

    if (!mt5Account || !licenseKey) {
        return NextResponse.json({ valid: false, error: 'Missing Info' }, { status: 400 });
    }

    // 1. Kiểm tra License (Xác thực quân nhân)
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
        return NextResponse.json({ 
            valid: false, 
            remoteCommand: "STOP_IMMEDIATELY", 
            error: 'UNAUTHORIZED' 
        }, { status: 401 });
    }

    const userData = snapshot.docs[0].data();
    const botMT5 = String(mt5Account).trim();
    const isPaused = userData.remoteCommand === "PAUSE";

    // 🎯 2. CẬP NHẬT FIRESTORE (LƯU ĐẦY ĐỦ PROFIT)
    await adminDb.collection('bots').doc(botMT5).set({
        botName: botName || "Spartan AI",
        mt5Account: Number(botMT5),
        
        balance: Number(data.balance) || 0,
        equity: Number(data.equity) || 0,
        floatingProfit: Number(data.floatingProfit) || 0,
        
        // 🔥 QUAN TRỌNG: LƯU TRƯỜNG PROFIT (NET REALIZED)
        // Nếu MT5 gửi lên thì lưu, không thì mặc định là 0
        profit: data.profit !== undefined ? Number(data.profit) : 0,

        lastHeartbeat: new Date().toISOString(),
        status: isPaused ? "PAUSED" : "RUNNING"
    }, { merge: true }); // Merge true để giữ lại các trường khác nếu có

    return NextResponse.json({ 
        valid: true, 
        success: true, 
        remoteCommand: isPaused ? "PAUSE" : "RUN" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Lỗi POST Sync:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
  } });
}
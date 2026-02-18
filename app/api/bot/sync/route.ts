import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// ==============================================================================
// 👇 HÀM GET: TRUY XUẤT THEO TRƯỜNG "TIME" (ISO STRING)
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
            profit: 0,
            symbol: "UNK",
            status: "OFFLINE" 
        };
        
        if (botSnap.exists) {
            const data = botSnap.data() || {};
            accountInfo = {
                botName: data.botName || "Spartan AI",
                symbol: data.symbol || "UNK",
                balance: data.balance || 0,
                equity: data.equity || 0,
                floatingProfit: data.floatingProfit || 0, 
                // Ưu tiên lấy 'profit' mới nhất từ MT5
                profit: data.profit !== undefined ? data.profit : (data.realizedProfit || 0),
                realizedProfit: data.profit !== undefined ? data.profit : (data.realizedProfit || 0),
                status: data.status || "UNKNOWN"
            };
        }

        // 🔥 TRUY VẤN THEO TRƯỜNG 'TIME' (String ISO giúp sort chính xác tuyệt đối)
        const tradesRef = botDocRef.collection("trades");
        const tradesSnap = await tradesRef.orderBy("time", "desc").limit(50).get();

        const trades = tradesSnap.docs.map(doc => {
            const d = doc.data();
            return {
                ticket: d.ticket,
                symbol: d.symbol,
                type: d.type,
                profit: Number(d.profit) || 0,
                time: d.time // Trả về chuỗi "2026-02-18T..."
            };
        });

        return NextResponse.json({ accountInfo, trades });

    } catch (error: any) {
        console.error("🔥 Lỗi GET Sync:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ==============================================================================
// 👇 HÀM POST: NHẬN HEARTBEAT & SYMBOL & ISO TIME
// ==============================================================================
export async function POST(req: Request) {
  try {
    const data = await req.json(); 
    const { 
        licenseKey, 
        mt5Account, 
        botName, 
        balance, 
        equity, 
        floatingProfit, 
        profit, 
        symbol, 
        time, // Thời gian ISO từ MT5 gửi sang
        status 
    } = data;

    if (!mt5Account || !licenseKey) {
        return NextResponse.json({ valid: false, error: 'Missing Info' }, { status: 400 });
    }

    // 1. Kiểm tra License
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

    // 🎯 2. CẬP NHẬT FIRESTORE (Đồng bộ trường 'time' và 'profit')
    await adminDb.collection('bots').doc(botMT5).set({
        mt5Account: Number(botMT5),
        botName: botName || "Spartan AI",
        balance: Number(balance) || 0,
        equity: Number(equity) || 0,
        floatingProfit: Number(floatingProfit) || 0,
        profit: profit !== undefined ? Number(profit) : 0,
        symbol: symbol || "UNK",
        brainActive: data.brainActive === true,
        
        // 🔥 Lấy time từ Bot gửi lên để khớp từng giây, nếu không có mới lấy giờ Server
        lastHeartbeat: time || new Date().toISOString(),
        
        status: isPaused ? "PAUSED" : (status || "RUNNING")
    }, { merge: true });

    return NextResponse.json({ 
        valid: true, 
        success: true, 
        remoteCommand: isPaused ? "PAUSE" : "RUN" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Lỗi POST Sync:", error);
    return NextResponse.json({ valid: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
  } });
}
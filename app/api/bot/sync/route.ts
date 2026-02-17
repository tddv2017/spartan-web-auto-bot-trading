import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// ==============================================================================
// 👇 HÀM GET: LẤY DỮ LIỆU HIỂN THỊ LÊN DASHBOARD
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
            balance: 0, 
            equity: 0, 
            floatingProfit: 0, 
            realizedProfit: 0, 
            status: "OFFLINE" 
        };
        
        if (botSnap.exists) {
            const data = botSnap.data() || {};
            accountInfo = {
                balance: data.balance || 0,
                equity: data.equity || 0,
                floatingProfit: data.floatingProfit || 0, 
                // 🔥 ĐỒNG BỘ: Ưu tiên lấy 'realizedProfit' để khớp với lệnh trade mới nhất
                realizedProfit: data.realizedProfit || data.profit || data.lastProfit || 0, 
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
// 👇 HÀM POST: NHẬN HEARTBEAT TỪ BOT (CẬP NHẬT BALANCE/EQUITY)
// ==============================================================================
export async function POST(req: Request) {
  try {
    const data = await req.json(); 
    const { licenseKey, mt5Account } = data;

    if (!mt5Account || !licenseKey) {
        return NextResponse.json({ valid: false, error: 'Missing Info' }, { status: 400 });
    }

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

    if (String(userData.mt5Account).trim() !== botMT5) {
        return NextResponse.json({ valid: false, error: 'Wrong MT5' }, { status: 401 });
    }

    const isPaused = userData.remoteCommand === "PAUSE";

    // 🎯 CẬP NHẬT CHIẾN THUẬT: 
    // Chỉ cập nhật các thông số biến động, KHÔNG ghi đè toàn bộ 'data' 
    // để tránh việc biến 'profit' bị xóa bởi gói tin heartbeat không có profit.
    await adminDb.collection('bots').doc(botMT5).set({
      balance: Number(data.balance) || 0,
      equity: Number(data.equity) || 0,
      floatingProfit: Number(data.floatingProfit) || 0,
      mt5Account: Number(botMT5),
      lastHeartbeat: new Date().toISOString(),
      status: isPaused ? "PAUSED" : "RUNNING"
    }, { merge: true }); // Sử dụng merge để bảo vệ trường 'realizedProfit' từ api/trade

    return NextResponse.json({ 
        valid: true, 
        success: true, 
        remoteCommand: isPaused ? "PAUSE" : "RUN" 
    }, { status: 200 });

  } catch (error: any) {
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
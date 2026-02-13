import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

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

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
  } });
}
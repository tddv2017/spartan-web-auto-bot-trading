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

    // 1. Chỉ tìm bằng LicenseKey (Bỏ where mt5Account đi để tránh lỗi kiểu dữ liệu Firebase)
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
        return NextResponse.json({ valid: false, success: false, error: 'Unauthorized Key' }, { status: 401 });
    }

    const userData = snapshot.docs[0].data();

    // 2. Ép cả 2 về String và gọt khoảng trắng để so sánh (Tuyệt đối không trượt)
    const dbMT5 = String(userData.mt5Account || "").trim();
    const botMT5 = String(mt5Account).trim();

    if (dbMT5 !== botMT5) {
        console.warn(`⛔ [SYNC BLOCK] Key ${licenseKey} đúng, nhưng MT5 lệch! DB: ${dbMT5} | Bot: ${botMT5}`);
        return NextResponse.json({ valid: false, success: false, error: 'Wrong MT5 Account' }, { status: 401 });
    }

    // 3. Khớp rồi thì ghi đè Heartbeat
    await adminDb.collection('bots').doc(botMT5).set({
      ...data,
      mt5Account: Number(botMT5),
      lastHeartbeat: new Date().toISOString(),
      updatedAt: new Date()
    }, { merge: true });

    return NextResponse.json({ valid: true, success: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ valid: false, success: false }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', } });
}
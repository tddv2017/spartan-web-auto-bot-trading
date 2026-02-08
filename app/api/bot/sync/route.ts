import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const data = await req.json(); 
    // Dữ liệu nhận từ Bot: { licenseKey, mt5Account, balance, equity, floatingProfit, symbol }

    if (!data.mt5Account) {
      return NextResponse.json({ success: false, message: "Missing MT5 Account" }, { status: 400 });
    }

    const mt5Id = data.mt5Account.toString();

    // 🔥 CẬP NHẬT REAL-TIME VÀO FIRESTORE
    // Lưu vào collection "bots" để tách biệt với user info
    await adminDb.collection('bots').doc(mt5Id).set({
      ...data,
      lastHeartbeat: new Date().toISOString(), // Dấu hiệu nhận biết Online
      updatedAt: new Date()
    }, { merge: true });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
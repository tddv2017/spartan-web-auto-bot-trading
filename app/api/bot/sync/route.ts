// app/api/bot/sync/route.ts
import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const data = await req.json(); 
    // Data nhận: { mt5Account, balance, equity, floatingProfit... }

    if (!data.mt5Account) return NextResponse.json({ success: false }, { status: 400 });

    const mt5Id = data.mt5Account.toString();

    // 🔥 CẬP NHẬT TRẠNG THÁI (HEARTBEAT)
    await adminDb.collection('bots').doc(mt5Id).set({
      ...data,
      lastHeartbeat: new Date().toISOString(), // 👈 QUAN TRỌNG: Cập nhật giờ hiện tại
      updatedAt: new Date()
    }, { merge: true });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
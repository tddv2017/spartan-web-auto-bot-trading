import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Lưu vào Firestore
    await addDoc(collection(db, "signals"), {
      symbol: body.symbol,
      type: body.type, // BUY_TREND, SELL_BREAKOUT...
      price: body.price,
      sl: body.sl,
      tp: body.tp,
      createdAt: serverTimestamp() // Lấy giờ server
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Mission Failed" }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { licenseKey, mt5Account, ticket, symbol, type, profit } = body;

    let strType = "UNKNOWN";
    if (type === 0 || type === "0" || type === "BUY") strType = "BUY";
    else if (type === 1 || type === "1" || type === "SELL") strType = "SELL";

    if (!licenseKey || !mt5Account) {
      return NextResponse.json({ valid: false, error: 'Key & MT5 Required' }, { status: 400 });
    }

    // 1. Chỉ tìm bằng LicenseKey
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("licenseKey", "==", licenseKey).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid Key' }, { status: 401 });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // 2. Ép kiểu String để so sánh an toàn
    const dbMT5 = String(userData.mt5Account || "").trim();
    const botMT5 = String(mt5Account).trim();

    if (dbMT5 !== botMT5) {
        return NextResponse.json({ valid: false, error: 'Wrong MT5 Account' }, { status: 401 });
    }

    // 3. Lưu Trade vào Database
    if (ticket) {
      const numTicket = Number(ticket);
      const tradeRef = adminDb.collection("users").doc(userId).collection("trades").doc(String(numTicket));

      await tradeRef.set({
        mt5Account: Number(botMT5),
        licenseKey: licenseKey,
        ticket: numTicket,
        symbol: symbol || "XAUUSD",
        type: strType,
        profit: Number(profit) || 0,
        closeTime: new Date().toISOString(),
        createdAt: new Date() 
      }, { merge: true });
    }

    return NextResponse.json({ valid: true, success: true, message: 'Spartan: Synced' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', } });
}
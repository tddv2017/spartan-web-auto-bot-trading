import { adminDb } from "@/lib/firebaseAdmin"; // Đảm bảo bên kia export đúng tên này
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra xem adminDb có hoạt động không
    if (!adminDb) {
      console.error("❌ LỖI: adminDb chưa được khởi tạo! Kiểm tra file lib/firebaseAdmin.js");
      return NextResponse.json({ success: false, error: "Database Connection Failed" }, { status: 500 });
    }

    const data = await req.json();
    console.log("📥 Nhận dữ liệu Trade:", data); // In ra để debug

    if (!data.mt5Account || !data.ticket) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu MT5 hoặc Ticket" }, { status: 400 });
    }

    const mt5Id = data.mt5Account.toString();
    const ticketId = data.ticket.toString();

    // 2. Ghi vào Firestore
    await adminDb
      .collection('bots')
      .doc(mt5Id)
      .collection('trades')
      .doc(ticketId)
      .set({
        ...data,
        time: new Date().toISOString(),
        timestamp: Date.now()
      });

    console.log("✅ Đã lưu lệnh:", ticketId);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 SERVER CRASHED:", error); // Xem lỗi này ở Terminal VS Code
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
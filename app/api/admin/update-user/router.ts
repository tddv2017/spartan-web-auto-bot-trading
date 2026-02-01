import { adminDb } from "../../../lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, newExpiryDate, newPlan } = await req.json();

    // Chuyển đổi ngày từ String sang Firebase Timestamp
    const expiryTimestamp = new Date(newExpiryDate);

    await adminDb.collection("users").doc(userId).update({
      expiryDate: expiryTimestamp,
      plan: newPlan,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, message: "Đã cập nhật quân lệnh!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi thực thi lệnh" }, { status: 500 });
  }
}
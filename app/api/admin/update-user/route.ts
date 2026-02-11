import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    console.log("------------------------------------------");
    console.log("🚀 [BƯỚC 1] API Nâng cấp đã nhận được tín hiệu!");

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error("Thiếu thẻ bài (Authorization Header)!");
    }
    const token = authHeader.split('Bearer ')[1];
    
    console.log("🚀 [BƯỚC 2] Đã lấy được Token, đang tiến hành giải mã Admin...");
    // ⚠️ NẾU BỊ SẬP Ở ĐÂY -> LỖI DO FIREBASE ADMIN CHƯA CẤU HÌNH ĐÚNG TRONG .ENV
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log("✅ [BƯỚC 2 OK] Người ra lệnh:", decodedToken.email);

    // KIỂM TRA QUYỀN (Nhớ sửa lại thành Email thật của ngài nhé)
    const ADMIN_EMAILS = ["tddv2017@gmail.com", "itcrazy2021pro@gmail.com"];
    if (!decodedToken.email || !ADMIN_EMAILS.includes(decodedToken.email)) {
        throw new Error(`Email ${decodedToken.email} không có quyền Tướng Quân!`);
    }

    console.log("🚀 [BƯỚC 3] Đang đọc dữ liệu gửi lên...");
    const body = await req.json();
    console.log("📦 Dữ liệu nhận được:", JSON.stringify(body));

    const { userId, newExpiryDate, newPlan } = body;
    if (!userId || !newPlan) throw new Error("Thiếu thông tin User ID hoặc Plan!");

    console.log("🚀 [BƯỚC 4] Bắt đầu ghi vào Database (Transaction)...");
    
    // Đơn giản hóa Transaction để test xem lỗi do code hay do Database
    await adminDb.runTransaction(async (t) => {
        const userRef = adminDb.collection("users").doc(userId);
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) throw new Error("Không tìm thấy lính này trong Database!");

        t.update(userRef, {
            expiryDate: new Date(newExpiryDate), 
            plan: newPlan,
            accountStatus: 'active', 
            updatedAt: new Date()
        });
    });

    console.log("🏆 [THÀNH CÔNG] Đã ghi xong Database!");
    console.log("------------------------------------------");

    return NextResponse.json({ success: true, message: "Đã nâng cấp thành công!" });

  } catch (error: any) {
    console.error("🔥 [BÁO ĐỘNG ĐỎ] LỖI TẠI SERVER:", error);
    // Trả lỗi chi tiết về thẳng Frontend để ngài nhìn thấy luôn trên thông báo Alert
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
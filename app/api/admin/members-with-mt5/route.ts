import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// 🛑 BẮT BUỘC: Đảm bảo API luôn chạy mới, không lưu cache cũ
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const usersRef = adminDb.collection("users");
        
        // Lấy tất cả user có trường mt5Account (khác rỗng)
        const snapshot = await usersRef
            .where("mt5Account", "!=", "")
            .get();

        const members = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    email: data.email,
                    mt5Account: data.mt5Account?.toString(),
                };
            })
            // Lọc kỹ lại một lần nữa để tránh data rác
            .filter(m => m.mt5Account && m.mt5Account !== "0" && m.mt5Account !== "undefined");

        return NextResponse.json(members);
    } catch (error: any) {
        console.error("🔥 Lỗi lấy danh sách quân đoàn:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
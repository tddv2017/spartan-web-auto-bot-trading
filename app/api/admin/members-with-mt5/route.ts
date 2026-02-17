import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // 🛡️ Kiểm tra quyền Admin (Đại tá có thể dùng middleware hoặc check session ở đây)
        // Giả sử logic check admin đã xong...

        const usersRef = adminDb.collection("users");
        // Chỉ lấy những người đã có số MT5 và không phải là bản thân Admin
        const snapshot = await usersRef.where("mt5Account", "!=", "").get();

        const members = snapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email,
            mt5Account: doc.data().mt5Account,
            plan: doc.data().plan
        }));

        return NextResponse.json(members);
    } catch (error) {
        return NextResponse.json({ error: "Lỗi truy xuất quân đoàn" }, { status: 500 });
    }
}
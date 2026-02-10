import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

// Định nghĩa dữ liệu đầu vào chuẩn
const UpdateUserSchema = z.object({
  userId: z.string(),
  newExpiryDate: z.string(), // Dạng ISO string "2026-12-31..."
  newPlan: z.enum(["free", "starter", "yearly", "LIFETIME"]),
  daysAdded: z.number().optional() // Số ngày vừa cộng thêm (để tính log)
});

// Bảng giá để tính hoa hồng (Hard-code để tránh bị hack giá từ Client)
const PLAN_PRICES: Record<string, number> = {
    "starter": 30,    // Gói tháng
    "yearly": 299,    // Gói năm
    "LIFETIME": 9999  // Gói vĩnh viễn
};

export async function POST(req: Request) {
  try {
    // 🛡️ BƯỚC 1: KIỂM TRA QUYỀN ADMIN (QUAN TRỌNG NHẤT)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ success: false, error: "CẤM TRUY CẬP!" }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check cứng email Admin (Thay bằng email thật của ngài)
    if (decodedToken.email !== "tddv2017@gmail.com" && decodedToken.email !== "itcrazy2021pro@gmail.com") {
        return NextResponse.json({ success: false, error: "Không phải Admin!" }, { status: 403 });
    }

    // 🛡️ BƯỚC 2: VALIDATE DỮ LIỆU
    const body = await req.json();
    const validation = UpdateUserSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json({ success: false, error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    const { userId, newExpiryDate, newPlan } = validation.data;

    // 🛡️ BƯỚC 3: THỰC HIỆN GIAO DỊCH (TRANSACTION)
    await adminDb.runTransaction(async (t) => {
        const userRef = adminDb.collection("users").doc(userId);
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) throw new Error("User không tồn tại");

        const userData = userDoc.data() || {};
        
        // A. Cập nhật User chính
        t.update(userRef, {
            expiryDate: new Date(newExpiryDate), // Admin SDK dùng Date object ok
            plan: newPlan,
            accountStatus: 'active', // Mở khóa luôn nếu đang bị pending
            updatedAt: new Date()
        });

        // B. Tính hoa hồng (Nếu có người giới thiệu & Gói có phí)
        const referrerCode = userData.referredBy;
        const price = PLAN_PRICES[newPlan] || 0;
        
        // Chỉ cộng tiền nếu có mã giới thiệu VÀ gói đó có giá trị > 0
        if (referrerCode && price > 0) {
            // Tìm ông Referrer
            const refQuery = await t.get(adminDb.collection("users").where("licenseKey", "==", referrerCode).limit(1));
            
            if (!refQuery.empty) {
                const referrerDoc = refQuery.docs[0];
                const refData = referrerDoc.data();
                
                // Tính 40% hoa hồng
                const commission = Number((price * 0.4).toFixed(2));
                
                // Cộng tiền vào ví Referrer
                const currentWallet = refData.wallet || { available: 0 };
                const newBalance = Number((currentWallet.available + commission).toFixed(2));

                t.update(referrerDoc.ref, {
                    "wallet.available": newBalance,
                    // Lưu log vào mảng referrals để hiển thị bên trang Partner
                    referrals: (refData.referrals || []).map((r: any) => {
                        if (r.uid === userId || r.email === userData.email) {
                            return { 
                                ...r, 
                                status: 'approved', 
                                plan: newPlan, 
                                commission: commission, 
                                updatedAt: new Date().toISOString() 
                            };
                        }
                        return r;
                    })
                });
            }
        }
    });

    return NextResponse.json({ success: true, message: "✅ Đã nâng cấp & trả hoa hồng!" });

  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Lỗi Server" }, { status: 500 });
  }
}
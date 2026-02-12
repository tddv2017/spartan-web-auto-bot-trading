import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"; 

export async function POST(req: Request) {
  try {
    // 1. KIỂM TRA QUYỀN (AN NINH)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token); // Xác thực Admin

    // 2. THỰC HIỆN SAO LƯU (SERVER SIDE - QUYỀN TỐI THƯỢNG)
    // Tên bảng backup: users_backup_YYYYMMDD (VD: users_backup_20260213)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const backupCollectionName = `users_backup_${today}`;
    
    // Lấy toàn bộ user hiện tại
    const snapshot = await adminDb.collection('users').get();
    
    if (snapshot.empty) {
        return NextResponse.json({ success: false, message: "Danh sách trống, không có gì để backup!" });
    }

    const batch = adminDb.batch(); // Dùng Batch để ghi hàng loạt
    let count = 0;

    snapshot.docs.forEach((doc) => {
        const userData = doc.data();
        // Tạo bản sao trong bảng backup
        const backupRef = adminDb.collection(backupCollectionName).doc(doc.id);
        batch.set(backupRef, {
            ...userData,
            _backupAt: new Date().toISOString() // Đánh dấu thời gian
        });
        count++;
    });

    // Thực thi ghi
    await batch.commit();

    return NextResponse.json({ 
        success: true, 
        message: `✅ Đã sao lưu thành công ${count} lính sang bảng '${backupCollectionName}'` 
    });

  } catch (error: any) {
    console.error("BACKUP ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Lỗi Server" }, { status: 500 });
  }
}
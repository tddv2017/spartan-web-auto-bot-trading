import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { amount, email } = await req.json(); // Nhận Email và Số tiền từ Frontend

    if (!email || !amount) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin!" }, { status: 400 });
    }

    // 1. Tìm User trong collection 'users' (hoặc 'resellers' tùy đại tá đặt tên lúc trước)
    // Vì AuthContext lưu theo UID hoặc Email, ta sẽ query để tìm doc
    // Cách an toàn nhất: Frontend gửi email, ta tìm doc có email đó
    
    // Giả sử User ID chính là Email (theo logic AuthContext cũ)
    // Nếu AuthContext lưu ID là UID, ta cần query. Ở đây tôi dùng query cho chắc ăn.
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản!" }, { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const currentWallet = userData.wallet || { available: 0, pending: 0, total_paid: 0 };

    // 2. Kiểm tra số dư
    if (amount > currentWallet.available) {
      return NextResponse.json({ success: false, message: "⚠️ Số dư không đủ để rút!" }, { status: 400 });
    }

    // 3. Trừ tiền
    const newWallet = {
      ...currentWallet,
      available: currentWallet.available - amount,
      pending: currentWallet.pending + amount // Chuyển sang trạng thái chờ duyệt
    };

    // 4. Cập nhật vào Firestore
    await updateDoc(doc(db, "users", userDoc.id), {
      wallet: newWallet
    });

    return NextResponse.json({ 
      success: true, 
      newBalance: newWallet.available,
      message: `✅ Lệnh rút $${amount} đã được gửi lên hệ thống!` 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi xử lý Server" }, { status: 500 });
  }
}
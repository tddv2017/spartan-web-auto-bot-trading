import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    // Nhận thêm email từ Frontend gửi lên
    const { key, email } = await req.json();

    if (!key || !email) {
       return NextResponse.json({ success: false, message: "Vui lòng nhập đủ thông tin!" }, { status: 400 });
    }
    
    // Tìm Document theo Key
    const docRef = doc(db, "resellers", key.toUpperCase()); // Key luôn viết hoa
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // KIỂM TRA EMAIL CÓ KHỚP KHÔNG (Không phân biệt hoa thường)
      if (data.email && data.email.toLowerCase() === email.toLowerCase()) {
          return NextResponse.json({ 
            success: true, 
            token: key, 
            user: { name: data.name, email: data.email } 
          });
      } else {
          // Key đúng nhưng Email sai
          return NextResponse.json({ success: false, message: "❌ Email không khớp với License Key này!" }, { status: 401 });
      }

    } else {
      return NextResponse.json({ success: false, message: "❌ Mã License không tồn tại!" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server Firebase" }, { status: 500 });
  }
}
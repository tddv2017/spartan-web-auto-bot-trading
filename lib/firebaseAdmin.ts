import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // 👇 QUAN TRỌNG: Fix lỗi xuống dòng (\n) khi deploy lên Vercel
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined,
    }),
  });
}

const adminDb = admin.firestore(); // Đổi tên biến thành adminDb cho đồng bộ
export { adminDb };                // Xuất ra đúng tên adminDb
export const adminAuth = admin.auth(); // Xuất auth nếu cần

// So sánh với đoạn code trong app/api/withdraw/route.ts

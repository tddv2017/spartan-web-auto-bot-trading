import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Kỹ thuật xử lý lỗi xuống dòng của Private Key trên Vercel
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("🛡️ Firebase Admin đã sẵn sàng tác chiến!");
  } catch (error) {
    console.error("❌ Lỗi khởi tạo Admin SDK:", error);
  }
}

const adminDb = admin.firestore();
export { adminDb }; 
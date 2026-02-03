import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUzL5c9CD_cCv9hP-FNrbTSRKOiIMxMOs",
  authDomain: "bot-trading-5f8c9.firebaseapp.com",
  projectId: "bot-trading-5f8c9",
  storageBucket: "bot-trading-5f8c9.firebasestorage.app",
  messagingSenderId: "725310671686",
  appId: "1:725310671686:web:0a901bb870d9ce9f0ab347",
  measurementId: "G-6SQJB8MD9H"
};

// 🛡️ CHỐNG LỖI 500: Kiểm tra xem App đã khởi tạo chưa trước khi tạo mới
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
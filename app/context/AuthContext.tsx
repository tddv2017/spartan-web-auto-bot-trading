"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// 🎖️ ĐỊNH NGHĨA HỒ SƠ CHIẾN BINH
interface UserProfile {
  licenseKey: string;
  plan: string;
  mt5Account: string;   // Tài khoản số 1
  mt5Account2?: string;  // Tài khoản số 2 (Dành cho Lifetime)
  email: string;
  expiryDate?: any;
  createdAt?: any;
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🛡️ DANH SÁCH BỘ CHỈ HUY (ADMIN) - Thêm email vào đây để phân quyền
const ADMIN_EMAILS = [
  "tddv2017@gmail.com", 
  "itcrazy2021pro@gmail.com", // Đại tá thay email thực tế của Phó tư lệnh vào đây
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        setUser(currentUser);
        
        // 🛡️ KIỂM TRA QUYỀN ADMIN TỪ DANH SÁCH
        const checkAdmin = currentUser.email ? ADMIN_EMAILS.includes(currentUser.email) : false;
        setIsAdmin(checkAdmin);

        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          // 🚀 KHỞI TẠO HỒ SƠ CHO LÍNH MỚI
          if (!userSnap.exists()) {
            console.log("🚀 Đang rèn License Key cho lính mới...");
            await setDoc(userRef, {
              email: currentUser.email,
              licenseKey: "SPARTAN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
              mt5Account: "",
              mt5Account2: "", // Khởi tạo sẵn ô tài khoản thứ 2
              plan: "FREE",
              createdAt: new Date(),
              expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Tặng 7 ngày dùng thử
            });
          }

          // 🛡️ LẮNG NGHE BIẾN ĐỘNG DỮ LIỆU REALTIME
          const unsubProfile = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
            }
            setLoading(false);
          });

          return () => unsubProfile();

        } catch (error) {
          console.error("❌ Lỗi Firebase Auth:", error);
          setLoading(false);
        }
      } else {
        // KHI THOÁT HỆ THỐNG
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Thêm gợi ý tài khoản để tránh lính bấm nhầm
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Lỗi đăng nhập quân doanh:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/"; // Đuổi về trang chủ khi thoát
    } catch (error) {
      console.error("Lỗi rút quân:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

interface UserProfile {
  licenseKey: string;
  plan: string;
  mt5Account: string;
  email: string; // Thêm email vào profile để quản lý dễ hơn
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
        
        // 🛡️ KIỂM TRA QUYỀN ADMIN
        setIsAdmin(currentUser.email === "tddv2017@gmail.com");

        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          // 🚀 NẾU LÀ LÍNH MỚI -> KHỞI TẠO HỒ SƠ
          if (!userSnap.exists()) {
            console.log("🚀 Đang khởi tạo hồ sơ lính mới...");
            await setDoc(userRef, {
              email: currentUser.email,
              licenseKey: "SPARTAN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
              mt5Account: "",
              plan: "FREE",
              createdAt: new Date(),
              expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
            });
          }

          // 🛡️ LẮNG NGHE DỮ LIỆU ĐỂ CẬP NHẬT REALTIME
          const unsubProfile = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              setProfile(doc.data() as UserProfile);
            }
            setLoading(false);
          });

          return () => unsubProfile();

        } catch (error) {
          console.error("❌ Lỗi Firebase trong AuthContext:", error);
          // Nếu lỗi (do Rules chặn), vẫn phải tắt Loading để không bị quay mòng mòng
          setLoading(false);
        }
      } else {
        // Nếu không có user (chưa đăng nhập)
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
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
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
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// 👇 1. CẬP NHẬT INTERFACE (Thêm displayName và photoURL)
export interface UserProfile {
  id: string; 
  licenseKey: string;
  plan: string;
  mt5Account: string;
  mt5Account2?: string;
  email: string;
  expiryDate?: any;
  createdAt?: any;
  displayName?: string; // 👈 Thêm dòng này (Tên hiển thị)
  photoURL?: string;    // 👈 Thêm dòng này (Avatar)
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

// DANH SÁCH ADMIN
const ADMIN_EMAILS = [
  "tddv2017@gmail.com", 
  "itcrazy2021pro@gmail.com", 
  "tran.tuan.2821994@gmail.com",
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
              // 👇 2. LƯU THÔNG TIN TỪ GOOGLE VÀO FIRESTORE
              displayName: currentUser.displayName || "Chiến Binh Mới",
              photoURL: currentUser.photoURL || "",
              licenseKey: "SPARTAN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
              mt5Account: "",
              mt5Account2: "", 
              plan: "FREE",
              createdAt: new Date(),
              expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
            });
          }

          // 🛡️ LẮNG NGHE REALTIME
          const unsubProfile = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setProfile({
                id: docSnap.id, 
                ...docSnap.data()
              } as UserProfile);
            }
            setLoading(false);
          });

          return () => unsubProfile();

        } catch (error) {
          console.error("❌ Lỗi Firebase Auth:", error);
          setLoading(false);
        }
      } else {
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
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/"; 
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
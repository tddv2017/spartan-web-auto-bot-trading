"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// 👇 1. Đảm bảo có dòng export này và có trường id
export interface UserProfile {
  id: string; // 👈 QUAN TRỌNG NHẤT
  licenseKey: string;
  plan: string;
  mt5Account: string;
  mt5Account2?: string;
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

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email,
              licenseKey: "SPARTAN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
              mt5Account: "",
              mt5Account2: "",
              plan: "FREE",
              createdAt: new Date(),
              expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
          }

          const unsubProfile = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              // 👇 2. Đảm bảo lấy ID ở đây
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
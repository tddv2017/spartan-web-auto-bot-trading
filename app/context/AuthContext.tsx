"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, arrayUnion, serverTimestamp } from "firebase/timestamp";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export interface UserProfile {
  id: string; 
  uid: string;
  licenseKey: string;
  plan: string;
  mt5Account: string;
  email: string;
  expiryDate?: any;
  displayName?: string;
  photoURL?: string;
  accountStatus: 'new' | 'pending' | 'active' | 'rejected';
  referredBy?: string | null;
  referrals: Array<{ 
    uid: string; 
    email: string; 
    date: string; 
    plan: string;
    commission: number;
    status: 'pending' | 'approved' | 'rejected' 
  }>;
  createdAt: any;
  wallet: { available: number; pending: number; total_paid: number; };
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
const ADMIN_EMAILS = ["tddv2017@gmail.com", "itcrazy2021pro@gmail.com"];

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
        setIsAdmin(ADMIN_EMAILS.includes(currentUser.email || ""));
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const referrerCode = typeof window !== 'undefined' ? localStorage.getItem('spartan_referrer') : null;
          const newUserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "Chiến Binh",
            photoURL: currentUser.photoURL || "",
            licenseKey: "SPARTAN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
            accountStatus: 'new', 
            plan: "free",
            createdAt: serverTimestamp(),
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            wallet: { available: 0, pending: 0, total_paid: 0 },
            referrals: [], // Khởi tạo mảng rỗng chuẩn
            referredBy: referrerCode || null 
          };
          await setDoc(userRef, newUserData);

          if (referrerCode) {
            const q = query(collection(db, "users"), where("licenseKey", "==", referrerCode));
            const qSnap = await getDocs(q);
            if (!qSnap.empty) {
              await updateDoc(qSnap.docs[0].ref, {
                referrals: arrayUnion({
                  uid: currentUser.uid,
                  email: currentUser.email,
                  date: new Date().toISOString(),
                  plan: "free",
                  commission: 0,
                  status: "pending"
                })
              });
            }
          }
        }
        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUser(null); setProfile(null); setIsAdmin(false); setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    if (typeof window !== 'undefined') localStorage.removeItem("spartan_referrer");
    window.location.href = "/";
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
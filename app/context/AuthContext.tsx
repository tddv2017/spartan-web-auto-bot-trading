"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; // Giữ nguyên đường dẫn của Đại tá
import { 
  doc, getDoc, setDoc, onSnapshot, 
  collection, query, where, getDocs, updateDoc, arrayUnion 
} from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU USER
export interface UserProfile {
  id: string; 
  licenseKey: string;
  plan: string;
  mt5Account: string;
  mt5Account2?: string;
  email: string;
  expiryDate?: any;
  createdAt?: any;
  displayName?: string;
  photoURL?: string;
  wallet?: {
    available: number;
    pending: number;
    total_paid: number;
  };
  referrals?: Array<{
    user: string;
    date: string;
    package: string;
    commission: number;
    status: 'pending' | 'approved';
  }>;
  referredBy?: string; // 👇 Thêm trường này để biết ai giới thiệu
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
  "admin@gmail.com" 
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

          // -----------------------------------------------------------
          // 🚀 LOGIC TẠO TÀI KHOẢN MỚI & GHI NHẬN REFERRAL
          // -----------------------------------------------------------
          if (!userSnap.exists()) {
            console.log("🚀 Lính mới! Đang tạo hồ sơ & kiểm tra người giới thiệu...");
            
            // 1. Lấy mã giới thiệu từ LocalStorage (Được lưu khi khách nhấp link ?ref=...)
            // Lưu ý: Cần đảm bảo file app/page.tsx đã lưu mã này vào 'spartan_license' hoặc 'spartan_referrer'
            // Ở đây tôi dùng thống nhất là 'spartan_referrer' cho rõ ràng
            const referrerCode = typeof window !== 'undefined' ? localStorage.getItem('spartan_referrer') : null;

            // 2. Tạo hồ sơ User mới
            const newUserData = {
              email: currentUser.email,
              displayName: currentUser.displayName || "Chiến Binh Mới",
              photoURL: currentUser.photoURL || "",
              licenseKey: "SPARTAN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
              mt5Account: "",
              mt5Account2: "", 
              plan: "FREE",
              createdAt: new Date(),
              expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày dùng thử
              wallet: {
                available: 0,
                pending: 0,
                total_paid: 0
              },
              referrals: [],
              referredBy: referrerCode || null // Lưu lại ân nhân
            };

            await setDoc(userRef, newUserData);

            // 3. CẬP NHẬT CHO ĐẠI LÝ (NẾU CÓ MÃ GIỚI THIỆU)
            if (referrerCode) {
                try {
                    // Tìm ông Đại lý sở hữu mã này
                    const q = query(collection(db, "users"), where("licenseKey", "==", referrerCode));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const referrerDoc = querySnapshot.docs[0];
                        
                        // Thêm lính mới vào danh sách referrals của Đại lý
                        await updateDoc(referrerDoc.ref, {
                            referrals: arrayUnion({
                                user: currentUser.displayName || currentUser.email,
                                date: new Date().toLocaleDateString('vi-VN'), // Ngày gia nhập
                                package: "FREE (Trial)", // Gói ban đầu
                                commission: 0, // Chưa có tiền
                                status: "pending" // Chờ mua gói
                            })
                        });
                        console.log("✅ Đã ghi công cho Đại lý:", referrerCode);
                    } else {
                        console.warn("⚠️ Mã giới thiệu không tồn tại:", referrerCode);
                    }
                } catch (err) {
                    console.error("❌ Lỗi cập nhật Referral:", err);
                }
            }
          }
          // -----------------------------------------------------------

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
      // Xóa luôn mã ref khi logout để tránh dính cho lần sau (tùy chọn)
      localStorage.removeItem("spartan_referrer"); 
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
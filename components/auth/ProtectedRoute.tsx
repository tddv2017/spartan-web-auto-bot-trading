"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation"; // Dùng next/navigation cho Next 13+
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đã tải xong mà không thấy user -> Đá về trang chủ/login
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // 1. TRƯỜNG HỢP ĐANG TẢI: Hiện màn hình Loading thay vì màn hình đen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center text-green-500">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="font-mono text-xs tracking-[0.2em] animate-pulse">AUTHENTICATING...</p>
      </div>
    );
  }

  // 2. TRƯỜNG HỢP CHƯA CÓ USER (Đang đợi redirect): Cũng hiện Loading hoặc null
  if (!user) {
    return null; // Hoặc giữ nguyên màn hình loading ở trên
  }

  // 3. ĐÃ CÓ USER: Cho phép vào
  return <>{children}</>;
}
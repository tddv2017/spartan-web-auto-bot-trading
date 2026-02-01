"use client";
import { useAuth } from "./../../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Phát hiện xâm nhập -> Đá về Login
      router.push("/login");
    }
  }, [user, loading, router]);

  // 1. Đang check xem là ai -> Hiện vòng quay
  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  // 2. Chưa đăng nhập -> Không hiển thị gì cả (đợi redirect)
  if (!user) {
    return null;
  }

  // 3. Đã đăng nhập -> Mời vào (Render nội dung bên trong)
  return <>{children}</>;
}
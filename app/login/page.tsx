"use client";
import React, { useState, useEffect } from 'react'; // Nhớ import useEffect
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, user, loading } = useAuth(); // Lấy thêm biến loading
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 👇 KHẮC PHỤC: Bọc lệnh chuyển trang vào useEffect
  // Chỉ chạy khi 'user' hoặc 'loading' thay đổi
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Trong lúc đang check User hoặc đang chuyển hướng -> Không hiện form để tránh nháy
  if (loading || user) {
    return null; 
  }

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await login();
    // Không cần xử lý gì thêm, useEffect ở trên sẽ tự bắt sự kiện user thay đổi và chuyển trang
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* NÚT QUAY LẠI */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-400 hover:text-white hover:-translate-x-1 transition-all group z-20"
      >
        <div className="p-2 bg-slate-900 rounded-full border border-slate-800 group-hover:border-green-500 group-hover:bg-green-500/10">
           <ArrowLeft className="w-5 h-5 group-hover:text-green-500" />
        </div>
        <span className="font-bold text-sm">Quay lại Trang chủ</span>
      </Link>

      {/* Hiệu ứng nền */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* FORM LOGIN */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg text-center">
        
        <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-black font-black text-3xl mx-auto mb-6 shadow-lg shadow-green-500/20">
          S
        </div>

        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">SPARTAN COMMAND</h2>
        <p className="text-slate-400 mb-8 text-sm">
          Đăng nhập hoặc Đăng ký để truy cập hệ thống Bot V7.2
        </p>

        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full py-4 bg-white hover:bg-gray-100 active:scale-95 text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-all mb-6 group relative overflow-hidden"
        >
          {isLoggingIn ? (
             <span className="flex items-center gap-2">
               <span className="w-4 h-4 border-2 border-slate-400 border-t-black rounded-full animate-spin"></span>
               Đang kết nối...
             </span>
          ) : (
            <>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
              <span>Tiếp tục với Google</span>
            </>
          )}
        </button>

        <div className="text-xs text-slate-500 space-y-4">
          <p className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>Bảo mật tuyệt đối bởi Google Firebase</span>
          </p>
          <div className="border-t border-slate-800 pt-4">
            <p>Chưa có tài khoản? <span className="text-green-500 font-bold">Hệ thống sẽ tự động tạo mới</span> khi bạn đăng nhập bằng Google.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
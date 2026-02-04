"use client"; // 👈 1. BẮT BUỘC PHẢI CÓ
import React, { useEffect, Suspense } from 'react'; // 👈 2. Import đủ đồ nghề
import { useSearchParams } from 'next/navigation';
import Navbar from "@/components/landing/Navbar"; // Đã sửa đường dẫn thành @ cho chuẩn
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import Performance from "@/components/landing/Performance";
import VerifiedReport from "@/components/landing/VerifiedReport";

// --- COMPONENT CON: CHUYÊN ĐI BẮT KHÁCH (TRACKER) ---
// Tách ra để bọc Suspense, giúp trang web không bị lỗi khi build
const ReferralTracker = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Lưu vào bộ nhớ trình duyệt
      localStorage.setItem('spartan_referrer', refCode);
      console.log("🎯 Đã ghi nhận người giới thiệu:", refCode);
    }
  }, [searchParams]);

  return null; // Component này tàng hình, không vẽ gì ra màn hình
};

// --- TRANG CHÍNH ---
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-green-500 selection:text-black overflow-x-hidden">
      
      {/* 👇 3. BỌC LOGIC BẮT KHÁCH VÀO SUSPENSE ĐỂ TRÁNH LỖI BUILD */}
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>

      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <Performance />
        <VerifiedReport />
        <Pricing />
      </main>

      <Footer />
      
    </div>
  );
}
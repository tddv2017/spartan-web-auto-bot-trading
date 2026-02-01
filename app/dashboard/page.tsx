"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { LogOut, Copy, Check, CreditCard, Activity, Clock, ShieldCheck, Zap } from 'lucide-react';
import PaymentModal from '../../components/landing/PaymentModal';

function DashboardContent() {
  const { user, profile, logout } = useAuth();
  const searchParams = useSearchParams();
  
  const [copied, setCopied] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  const isExpired = useMemo(() => {
    if (!profile?.expiryDate) return false;
    const seconds = profile.expiryDate.seconds || profile.expiryDate._seconds;
    if (!seconds) return false;
    return seconds < Date.now() / 1000;
  }, [profile]);

  useEffect(() => {
    const action = searchParams.get("action");
    const plan = searchParams.get("plan");
    
    if (action === "checkout") {
      if (plan) setSelectedPlan(plan);
      setIsPayOpen(true);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const handleCopy = () => {
    if (profile?.licenseKey) {
      navigator.clipboard.writeText(profile.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatExpiryDate = () => {
    if (!profile?.expiryDate) return "Vĩnh viễn";
    const seconds = profile.expiryDate.seconds || profile.expiryDate._seconds;
    if (!seconds) return "Đang cập nhật...";
    return new Date(seconds * 1000).toLocaleDateString('vi-VN');
  };

  if (!profile && user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-green-500">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black tracking-[0.3em] uppercase animate-pulse text-sm">Đang quét danh bạ chiến binh...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-green-500/30">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 font-black text-xl italic text-green-500 tracking-tighter">
          SPARTAN <span className="text-white opacity-50 underline decoration-green-500">V3.0</span>
        </div>
        <button 
          onClick={() => logout()} 
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold text-xs bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 hover:border-red-500/30"
        >
          <LogOut size={16} /> THOÁT HỆ THỐNG
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 leading-none tracking-tight">
              CHÀO CHIẾN BINH, <br/>
              <span className="text-green-500 uppercase">{user?.displayName?.split(' ')[0] || "SPARTAN"}</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${isExpired ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'} rounded-full animate-pulse`}></div>
              <span className={`text-[10px] font-black tracking-widest uppercase ${isExpired ? 'text-red-500' : 'text-slate-400'}`}>
                {isExpired ? 'Gói cước đã hết hạn - Yêu cầu gia hạn' : 'Hệ thống đang hoạt động'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {profile?.plan && profile?.plan !== "free" && (
              <button 
                onClick={() => { setSelectedPlan(profile.plan); setIsPayOpen(true); }}
                className="flex items-center gap-2 px-6 py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 shadow-xl active:scale-95 group"
              >
                <CreditCard size={18} className="group-hover:rotate-12 transition-transform" /> GIA HẠN {profile.plan.toUpperCase()}
              </button>
            )}

            <button 
              onClick={() => { setSelectedPlan("starter"); setIsPayOpen(true); }}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-pulse"
            >
              <Zap size={20} fill="currentColor" /> NÂNG CẤP TÀI KHOẢN
            </button>
          </div>
        </div>

        {/* 🛡️ LICENSE CARD */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-slate-500 font-bold uppercase text-[10px] mb-4 tracking-[0.2em]">Kích hoạt License tại MT5</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <code className="text-4xl md:text-6xl font-mono font-black text-white tracking-tighter break-all">
                {profile?.licenseKey || "••••••••••••"}
              </code>
              <button 
                onClick={handleCopy} 
                className="bg-white text-black px-6 py-4 rounded-2xl font-black hover:bg-green-500 transition-all flex items-center gap-2 text-sm active:scale-90"
              >
                {copied ? <Check size={20} className="text-green-700" /> : <Copy size={20}/>} 
                {copied ? "ĐÃ SAO CHÉP" : "SAO CHÉP MÃ"}
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-green-500/10 blur-[120px] group-hover:bg-green-500/20 transition-all duration-700"></div>
        </div>

        {/* 🚀 KHU VỰC TẢI VŨ KHÍ (Nằm trong return) */}
        {profile?.plan && profile?.plan !== "free" && (
          <div className="bg-gradient-to-r from-green-900/20 to-slate-900 border border-green-500/30 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
            <div className="flex items-center gap-5">
              <div className="bg-green-500 p-4 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <Activity size={32} className="text-black" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Kho Vũ Khí Spartan V3.0</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sẵn sàng xuất kích trên MT5</p>
              </div>
            </div>
            <a 
              href="https://docs.google.com/uc?export=download&id=188effdjSpmDbMy3J3fBCY2tQTGU9RCoA" 
              download="SpartanV3.ex5" // Đặt tên file khi tải về
              className="flex items-center gap-3 px-10 py-5 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl transition-all hover:scale-105 shadow-lg active:scale-95 group"
            >
              <Zap size={20} fill="currentColor" className="group-hover:animate-bounce" />
              TẢI BOT CHIẾN ĐẤU NGAY
            </a>
          </div>
        )}

        {/* 📊 GRID THÔNG SỐ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatBox label="Tài khoản MT5" value={profile?.mt5Account || "CHƯA KẾT NỐI"} icon={<Activity size={18}/>} />
          <StatBox label="Hạn sử dụng" value={formatExpiryDate()} icon={<Clock size={18}/>} color={isExpired ? "text-red-500 animate-pulse font-black" : "text-blue-400"} />
          <StatBox label="Quân hàm" value={profile?.plan === "starter" ? "PRO" : profile?.plan === "yearly" ? "VIP YEARLY" : profile?.plan === "lifetime" ? "VIP LIFETIME" : "FREE"} icon={<ShieldCheck size={18}/>} color={profile?.plan === "starter" ? "text-green-400" : "text-amber-400"} />
        </div>
      </div>

      <PaymentModal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} plan={selectedPlan} />
    </div>
  );
}

function StatBox({ label, value, icon, color = "text-white" }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm hover:border-slate-700 transition-all group">
      <div className="text-slate-500 text-[11px] font-black mb-4 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-slate-300">
        {icon} {label}
      </div>
      <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-green-500 font-black italic">INITIALIZING...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
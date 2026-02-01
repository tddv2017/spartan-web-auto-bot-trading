"use client";
import React, { useState, useEffect, Suspense } from 'react';
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

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* NAVBAR */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 font-black text-xl italic text-green-500 underline decoration-green-500/30">SPARTAN V30</div>
        <button onClick={() => logout()} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold text-sm">
          <LogOut size={18} /> THOÁT
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* HEADER & ACTION BUTTONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 leading-tight">
              CHÀO CHIẾN BINH, <br/>
              <span className="text-green-500 uppercase">{user?.displayName?.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold tracking-widest uppercase">Live Connection Active</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* 1. Nút Gia hạn: Chỉ hiện khi đã có gói */}
            {profile?.plan && profile?.plan !== "free" && (
              <button 
                onClick={() => { setSelectedPlan(profile.plan); setIsPayOpen(true); }}
                className="px-6 py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-all border border-slate-700 shadow-lg active:scale-95"
              >
                <CreditCard size={18} className="inline mr-2" /> GIA HẠN {profile.plan.toUpperCase()}
              </button>
            )}

            {/* 2. Nút Nâng cấp tổng lực: Luôn hiện để lính mới có chỗ nộp tiền */}
            <button 
              onClick={() => {
                setSelectedPlan("starter"); 
                setIsPayOpen(true);
              }}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-pulse"
            >
              <Zap size={20} fill="currentColor" /> NÂNG CẤP TÀI KHOẢN NGAY
            </button>
          </div>
        </div>

        {/* LICENSE CARD */}
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-slate-500 font-bold uppercase text-[10px] mb-4 tracking-[0.2em]">Active License Key</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <code className="text-4xl md:text-6xl font-mono font-black text-white tracking-tighter">
                {profile?.licenseKey || "••••••••••••"}
              </code>
              <button onClick={handleCopy} className="bg-white text-black px-6 py-3 rounded-xl font-black hover:bg-green-500 transition-all flex items-center gap-2 text-sm active:scale-95">
                {copied ? <Check size={18}/> : <Copy size={18}/>} {copied ? "ĐÃ SAO CHÉP" : "COPY KEY"}
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-green-500/10 blur-[120px] group-hover:bg-green-500/20 transition-all"></div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatBox 
            label="Tài khoản MT5" 
            value={profile?.mt5Account || "CHƯA KHÓA"} 
            icon={<Activity size={16}/>} 
          />
          <StatBox 
            label="Hạn sử dụng" 
            value={formatExpiryDate()} 
            icon={<Clock size={16}/>} 
            color="text-blue-400" 
          />
          <StatBox 
            label="Cấp bậc" 
            value={
              profile?.plan === "starter" ? "PRO (Daily)" : 
              profile?.plan === "yearly" ? "VIP (Yearly)" : 
              profile?.plan === "lifetime" ? "VIP (Lifetime)" : "FREE"
            } 
            icon={<ShieldCheck size={16}/>} 
            color={profile?.plan === "starter" ? "text-green-400" : "text-amber-400"} 
          />
        </div>
      </div>

      <PaymentModal 
        isOpen={isPayOpen} 
        onClose={() => setIsPayOpen(false)} 
        plan={selectedPlan} 
      />
    </div>
  );
}

function StatBox({ label, value, icon, color = "text-white" }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-700 transition-all">
      <div className="text-slate-500 text-[10px] font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
        {icon} {label}
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-green-500 font-black">SYSTEM LOADING...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
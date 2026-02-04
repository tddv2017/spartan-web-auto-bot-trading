"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LogOut, Copy, Check, CreditCard, Activity, Clock, ShieldCheck, Zap, 
  Home, ChevronLeft, Terminal, PlayCircle 
} from 'lucide-react';
import PaymentModal from '@/components/landing/PaymentModal';

function DashboardContent() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage(); 
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
    if (!profile?.expiryDate) return t.dashboard.status.lifetime;
    const seconds = profile.expiryDate.seconds || profile.expiryDate._seconds;
    if (!seconds) return t.dashboard.status.updating;
    return new Date(seconds * 1000).toLocaleDateString('vi-VN');
  };

  if (!profile && user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-green-500">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black tracking-[0.3em] uppercase animate-pulse text-sm">
          {t.dashboard.loading || "Đang quét danh bạ chiến binh..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-green-500/30">
      
      {/* 1. NAVBAR */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 font-black text-xl italic text-green-500 tracking-tighter">
            SPARTAN <span className="text-white opacity-50 underline decoration-green-500">V3.0</span>
          </div>

          <Link 
            href="/" 
            className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors text-xs font-bold uppercase tracking-widest group"
          >
            <div className="p-1 rounded-full border border-slate-700 group-hover:border-green-500 transition-colors">
              <ChevronLeft size={12} />
            </div>
            <Home size={14} /> 
            <span className="hidden sm:inline">{t.dashboard.home}</span>
          </Link>
        </div>

        <button 
          onClick={() => logout()} 
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold text-xs bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 hover:border-red-500/30"
        >
          <LogOut size={16} /> <span className="hidden sm:inline">{t.dashboard.logout}</span>
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* 2. HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 leading-none tracking-tight">
              {t.dashboard.welcome}, <br/>
              <span className="text-green-500 uppercase">{user?.displayName?.split(' ')[0] || "SPARTAN"}</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${isExpired ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'} rounded-full animate-pulse`}></div>
              <span className={`text-[10px] font-black tracking-widest uppercase ${isExpired ? 'text-red-500' : 'text-slate-400'}`}>
                {isExpired ? t.dashboard.status.expired : t.dashboard.status.active}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {profile?.plan && profile?.plan !== "free" && (
              <button 
                onClick={() => { setSelectedPlan(profile.plan); setIsPayOpen(true); }}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-700 transition-all border border-slate-700 active:scale-95 group"
              >
                <CreditCard size={16} className="group-hover:rotate-12 transition-transform" /> {t.dashboard.btn.renew}
              </button>
            )}

            <button 
              onClick={() => { setSelectedPlan("starter"); setIsPayOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-400 text-black font-black text-sm rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
            >
              <Zap size={18} fill="currentColor" /> {t.dashboard.btn.upgrade}
            </button>
          </div>
        </div>

        {/* 3. LICENSE CARD */}
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-colors">
          <div className="relative z-10">
            <h3 className="text-slate-500 font-bold uppercase text-[10px] mb-4 tracking-[0.2em] flex items-center gap-2">
              <Activity size={12} className="text-green-500"/> {t.dashboard.license.title}
            </h3>
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <code className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter break-all select-all">
                {profile?.licenseKey || "LOADING..."}
              </code>
              <button 
                onClick={handleCopy} 
                className="bg-white text-black px-6 py-3 rounded-xl font-black hover:bg-green-500 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 shadow-lg w-fit"
              >
                {copied ? <Check size={18} className="text-green-700" /> : <Copy size={18}/>} 
                {copied ? t.dashboard.btn.copied : t.dashboard.btn.copy}
              </button>
            </div>
            <p className="text-slate-500 text-xs italic mt-4">{t.dashboard.license.note}</p>
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-green-500/5 blur-[100px] group-hover:bg-green-500/10 transition-all duration-700"></div>
        </div>

        {/* 5. DOWNLOAD SECTION */}
        {profile?.plan && profile?.plan !== "free" ? (
          <div className="bg-gradient-to-r from-green-900/20 to-slate-900 border border-green-500/30 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(34,197,94,0.05)] relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="bg-green-500 p-4 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <ShieldCheck size={32} className="text-black" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t.dashboard.download.title}</h3>
                <p className="text-green-400 text-xs font-bold uppercase tracking-widest mt-1">{t.dashboard.download.unlocked}</p>
              </div>
            </div>
            <a 
              href="https://docs.google.com/uc?export=download&id=1BGtSMioGSIk-kkSrhmvipGW1gTg4LHTQ" // Link tải về bản cài đặt
              className="relative z-10 flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl transition-all hover:scale-105 shadow-lg active:scale-95 group w-full md:w-auto justify-center"
            >
              <Zap size={20} fill="currentColor" className="group-hover:animate-bounce" />
              {t.dashboard.btn.download}  
            </a>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] text-center">
            <p className="text-slate-500 text-sm">{t.dashboard.download.locked}</p>
          </div>
        )}

        {/* 6. STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatBox label={t.dashboard.stats.account} value={profile?.mt5Account || t.dashboard.status.unconnected} icon={<Activity size={18}/>} />
          <StatBox label={t.dashboard.stats.expiry} value={formatExpiryDate()} icon={<Clock size={18}/>} color={isExpired ? "text-red-500 animate-pulse font-black" : "text-blue-400"} />
          <StatBox label={t.dashboard.stats.rank} value={profile?.plan === "starter" ? "PRO" : profile?.plan === "yearly" ? "VIP YEARLY" : profile?.plan === "lifetime" ? "VIP LIFETIME" : "FREE"} icon={<ShieldCheck size={18}/>} color={profile?.plan === "starter" ? "text-green-400" : "text-amber-400"} />
        </div>

        {/* 7. GUIDE */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
            <Terminal size={20} className="text-green-500" />
            {t.dashboard.guide.title}
          </h3>

          <div className="space-y-6">
            <Step 
              num="01" 
              title={t.dashboard.guide.step1_title} 
              desc={t.dashboard.guide.step1_desc}
            />
            <Step 
              num="02" 
              title={t.dashboard.guide.step2_title} 
              desc={t.dashboard.guide.step2_desc}
              code="https://spartan-web-auto-bot-trading.vercel.app/" 
            />
            <Step 
              num="03" 
              title={t.dashboard.guide.step3_title} 
              desc={t.dashboard.guide.step3_desc}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <button className="text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto transition-colors text-sm hover:underline">
              <PlayCircle size={16} /> {t.dashboard.btn.video}
            </button>
          </div>
        </div>

      </div>

      <PaymentModal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} plan={selectedPlan} />
    </div>
  );
}

// Component con: Hộp thông số
function StatBox({ label, value, icon, color = "text-white" }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm hover:border-slate-700 transition-all group">
      <div className="text-slate-500 text-[10px] font-black mb-3 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-slate-300">
        {icon} {label}
      </div>
      <div className={`text-xl font-black tracking-tight truncate ${color}`}>{value}</div>
    </div>
  );
}

// Component con: Bước hướng dẫn
function Step({ num, title, desc, code }: { num: string, title: string, desc: string, code?: string }) {
  return (
    <div className="flex gap-4">
      <div className="font-black text-2xl text-slate-800">{num}</div>
      <div>
        <h4 className="font-bold text-white text-base mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">{desc}</p>
        {code && (
          <div className="bg-black/50 p-2 rounded border border-slate-700 font-mono text-green-400 text-xs inline-block break-all select-all">
            {code}
          </div>
        )}
      </div>
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
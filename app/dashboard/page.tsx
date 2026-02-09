"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '@/lib/firebase'; 
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore'; 
import { 
  LogOut, Home, LayoutGrid, Radar, Users, 
  Shield, Swords, Medal, Crown, Zap
} from 'lucide-react';

// 👇 IMPORT MODULES
import PaymentModal from '@/components/landing/PaymentModal';
import { VerificationLock } from '@/components/dashboard/onboarding/VerificationLock';
import { GuideModal } from '@/components/dashboard/modals/GuideModal';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { WarRoomTab } from '@/components/dashboard/tabs/WarRoomTab';
import { PartnerTab } from '@/components/dashboard/tabs/PartnerTab';

// --- 🎖️ HỆ THỐNG QUÂN HÀM (RANK SYSTEM) ---
const getRankInfo = (profile: any) => {
  if (!profile) return { title: 'UNIDENTIFIED', icon: Shield, color: 'text-slate-500', border: 'border-slate-800' };
  if (profile.role === 'admin') return { title: 'SUPREME LEADER', icon: Crown, color: 'text-yellow-400', border: 'border-yellow-600' };
  if (profile.accountStatus !== 'active') return { title: 'RECRUIT', icon: Shield, color: 'text-slate-500', border: 'border-slate-700' };
  if (profile.plan === 'LIFETIME' || (profile.wallet?.available > 1000)) return { title: 'COMMANDER', icon: Medal, color: 'text-green-400', border: 'border-green-600' };
  return { title: 'SOLDIER', icon: Swords, color: 'text-emerald-400', border: 'border-emerald-600' };
};

// --- 🔘 TAB BUTTON STYLE (ĐỒNG BỘ LANDING PAGE) ---
const TabButton = ({ active, onClick, icon, label, hasLiveBadge }: any) => (
  <button 
    onClick={onClick}
    className={`
      relative group flex items-center justify-center md:justify-start gap-3 px-6 py-4 transition-all duration-300 w-full md:w-auto min-w-[160px]
      border-b-2
      ${active 
        ? 'border-green-500 bg-green-500/5 text-white' 
        : 'border-transparent text-slate-500 hover:text-green-400 hover:bg-white/5'
      }
    `}
  >
    {/* Icon */}
    <div className={`transition-transform duration-300 ${active ? 'scale-110 text-green-500' : 'group-hover:scale-110'}`}>
      {icon}
    </div>

    {/* Label */}
    <span className={`text-sm md:text-base font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-500 group-hover:text-green-400'}`}>
      {label}
    </span>
    
    {/* 🔴 LIVE BADGE (ĐÈN BÁO ĐỘNG - KHÔNG CHIẾM DÒNG) */}
    {hasLiveBadge && (
      <div className="flex h-2.5 w-2.5 ml-1">
         <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
         <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
      </div>
    )}
  </button>
);

function DashboardContent() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage(); 
  const searchParams = useSearchParams();
  
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("LIFETIME"); 
  const [botData, setBotData] = useState<any>(null); 
  const [trades, setTrades] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'war-room' | 'partner'>('overview');

  const wallet = profile?.wallet || { available: 0, pending: 0, total_paid: 0 };
  const isAccountActive = (profile as any)?.accountStatus === 'active'; 
  const rank = getRankInfo(profile);
  const RankIcon = rank.icon;

  const isExpired = useMemo(() => {
    if (!profile?.expiryDate) return false;
    const seconds = profile.expiryDate.seconds || profile.expiryDate._seconds;
    if (!seconds) return false;
    return seconds < Date.now() / 1000;
  }, [profile]);

  const formatExpiryDate = () => {
    if (!profile?.expiryDate) return t.dashboard.status.lifetime;
    const seconds = profile.expiryDate.seconds || profile.expiryDate._seconds;
    if (!seconds) return t.dashboard.status.updating;
    return new Date(seconds * 1000).toLocaleDateString('vi-VN');
  };

  const handleWithdrawRequest = async () => {
    const amountStr = prompt(`Nhập số tiền muốn rút (Tối đa: $${wallet.available}):`); 
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) { alert("Số tiền không hợp lệ"); return; }
    if (amount > wallet.available) { alert("Số dư không đủ!"); return; }
    try {
        const res = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, amount: amount })
        });
        const data = await res.json();
        alert(data.message);
    } catch (e) { alert("Lỗi kết nối Server!"); }
  };

  useEffect(() => {
    if (!profile?.mt5Account || !isAccountActive) return; 
    const unsub = onSnapshot(doc(db, "bots", profile.mt5Account.toString()), (doc) => {
      if (doc.exists()) { setBotData(doc.data()); }
    });
    return () => unsub(); 
  }, [profile?.mt5Account, isAccountActive]);

  useEffect(() => {
    if (!profile?.mt5Account || !isAccountActive) return;
    const q = query(collection(db, "bots", profile.mt5Account.toString(), "trades"), orderBy("timestamp", "desc"), limit(50));
    const unsub = onSnapshot(q, (snapshot) => { setTrades(snapshot.docs.map(doc => doc.data())); });
    return () => unsub();
  }, [profile?.mt5Account, isAccountActive]);

  useEffect(() => {
    if (searchParams.get("action") === "checkout") {
      if (searchParams.get("plan")) setSelectedPlan(searchParams.get("plan")!);
      setIsPayOpen(true);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  if (!profile && user) return <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center gap-4 text-green-500 font-mono tracking-widest animate-pulse">:: INITIALIZING UPLINK ::</div>;

  return (
    // ✨ NỀN ĐỒNG BỘ 100% VỚI LANDING PAGE (#050b14 + Grid)
    <div className="min-h-screen bg-[#050b14] text-white font-sans selection:bg-green-500/30 pb-20 relative overflow-x-hidden">
      
      {/* 1. BACKGROUND GRID EFFECT (Y HỆT TRANG CHỦ) */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* --- 2. TOP COMMAND BAR --- */}
      <nav className="border-b border-white/5 bg-[#050b14]/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            
            {/* Logo & Rank */}
            <div className="flex items-center gap-6">
                 <Link href="/" className="group flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-600 text-black flex items-center justify-center font-black italic text-xl clip-path-polygon group-hover:bg-white transition-colors rounded">S</div>
                    <div className="hidden md:block">
                        <div className="font-black text-xl italic text-white tracking-tighter leading-none group-hover:text-green-500 transition-colors">SPARTAN</div>
                        <div className="text-[9px] text-green-500/60 tracking-[0.4em] font-bold uppercase">Trading Bot V7</div>
                    </div>
                 </Link>

                 {/* 🎖️ Rank Badge (Minimalist Military Style) */}
                 <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded border bg-black/50 backdrop-blur-sm ${rank.border}`}>
                    <RankIcon size={14} className={rank.color} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${rank.color}`}>{rank.title}</span>
                 </div>
            </div>

            {/* User Stats & Logout */}
            <div className="flex items-center gap-4">
                {profile?.mt5Account && isAccountActive && (
                    <div className="hidden lg:flex items-center gap-6 mr-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">BALANCE</span>
                            <span className="text-sm font-mono text-green-400 font-bold">${botData?.balance?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10"></div>
                         <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">PROFIT</span>
                            <span className={`text-sm font-mono font-bold ${botData?.floatingProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {botData?.floatingProfit > 0 ? '+' : ''}{botData?.floatingProfit?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </div>
                )}
                
                <button onClick={() => logout()} className="group flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                    <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Disconnect</span>
                    <LogOut size={20} />
                </button>
            </div>
        </div>
      </nav>

      {/* --- 3. MAIN DASHBOARD CONTENT --- */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 relative z-10">
        {!isAccountActive ? (
             <div className="mt-10 max-w-2xl mx-auto">
                <VerificationLock user={user} profile={profile} />
             </div>
        ) : (
            <>
                {/* --- NAVIGATION TABS (ĐỒNG BỘ STYLE) --- */}
                <div className="flex flex-col md:flex-row border-b border-white/10 mb-8 sticky top-[72px] bg-[#050b14]/95 backdrop-blur z-40 md:static md:bg-transparent">
                    <TabButton 
                        active={activeTab === 'overview'} 
                        onClick={() => setActiveTab('overview')} 
                        icon={<LayoutGrid size={18}/>} 
                        label="TỔNG QUAN" 
                    />
                    <TabButton 
                        active={activeTab === 'war-room'} 
                        onClick={() => setActiveTab('war-room')} 
                        icon={<Radar size={18}/>} 
                        label="CHIẾN TRƯỜNG" 
                        hasLiveBadge={true} 
                    />
                    <TabButton 
                        active={activeTab === 'partner'} 
                        onClick={() => setActiveTab('partner')} 
                        icon={<Users size={18}/>} 
                        label="ĐỐI TÁC" 
                    />
                </div>

                {/* --- TAB CONTENT --- */}
                <div className="min-h-[500px]">
                    {activeTab === 'overview' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <OverviewTab profile={profile} botData={botData} isExpired={isExpired} formatExpiryDate={formatExpiryDate} onOpenPay={(plan: string) => { setSelectedPlan(plan); setIsPayOpen(true); }} onOpenGuide={() => setIsGuideOpen(true)} />
                        </div>
                    )}
                    {activeTab === 'war-room' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <WarRoomTab trades={trades} accountInfo={botData} />
                        </div>
                    )}
                    {activeTab === 'partner' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <PartnerTab wallet={wallet} profile={profile} onWithdraw={handleWithdrawRequest} user={user} />
                        </div>
                    )}
                </div>
            </>
        )}
      </div>

      <PaymentModal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} plan={selectedPlan} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen bg-[#050b14] flex items-center justify-center text-green-500 font-mono tracking-widest">LOADING...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
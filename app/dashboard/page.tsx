"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { db } from '@/lib/firebase'; 
import { doc, onSnapshot, collection, query, orderBy, limit, updateDoc } from 'firebase/firestore'; 
import { 
  LogOut, LayoutGrid, Radar, Users, 
  Shield, Swords, Medal, Crown, Activity
} from 'lucide-react';

import PaymentModal from '@/components/landing/PaymentModal';
import { VerificationLock } from '@/app/dashboard/onboarding/VerificationLock';
import { GuideModal } from '@/app/dashboard/modals/GuideModal';
import { OverviewTab } from '@/app/dashboard/tabs/OverviewTab';
import { WarRoomTab } from '@/app/dashboard/tabs/WarRoomTab';
import { PartnerTab } from '@/app/dashboard/tabs/PartnerTab';

// XÁC ĐỊNH CẤP BẬC
const getRankInfo = (profile: any) => {
  if (!profile) return { title: 'UNIDENTIFIED', icon: Shield, color: 'text-slate-500', bg: 'bg-slate-800' };
  if (profile.role === 'admin') return { title: 'SUPREME LEADER', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' };
  if (profile.accountStatus !== 'active') return { title: 'RECRUIT', icon: Shield, color: 'text-slate-500', bg: 'bg-slate-800/50' };
  if (profile.plan === 'LIFETIME' || (profile.wallet?.available > 1000)) return { title: 'COMMANDER', icon: Medal, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  return { title: 'SOLDIER', icon: Swords, color: 'text-blue-500', bg: 'bg-blue-500/10' };
};

// NÚT CHUYỂN TAB (TAILADMIN STYLE)
const TabButton = ({ active, onClick, icon, label, hasLiveBadge }: any) => (
  <button 
    onClick={onClick}
    className={`
      relative flex items-center justify-center md:justify-start gap-2.5 px-6 py-3.5 transition-all duration-200 w-full md:w-auto min-w-[160px]
      border-b-2 text-sm font-bold uppercase tracking-wider
      ${active 
        ? 'border-blue-500 text-blue-500 bg-blue-500/5' 
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }
    `}
  >
    {icon}
    <span>{label}</span>
    {hasLiveBadge && (
      <span className="flex items-center gap-1.5 ml-2 text-[9px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20 font-black">
         <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
         LIVE
      </span>
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
  const isLifetime = profile?.plan === 'LIFETIME' || profile?.role === 'admin';

  const isExpired = useMemo(() => {
    if (isLifetime) return false; 
    if (!profile?.expiryDate) return false;
    const seconds = profile.expiryDate.seconds || profile.expiryDate._seconds;
    if (!seconds) return false;
    return seconds < Date.now() / 1000;
  }, [profile, isLifetime]); 

  const formatExpiryDate = () => {
    if (isLifetime) return t.dashboard.status.lifetime; 
    if (!profile?.expiryDate) return t.dashboard.status.lifetime;
    const seconds = profile.expiryDate.seconds || profile.expiryDate._seconds;
    if (!seconds) return t.dashboard.status.updating;
    return new Date(seconds * 1000).toLocaleDateString('vi-VN');
  };

  const handleWithdrawRequest = async () => {
    const amountStr = prompt(`Nhập số tiền muốn rút (Tối đa: $${wallet.available.toFixed(2)}):`); 
    if (!amountStr) return;
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) { alert("⚠️ Số tiền không hợp lệ"); return; }
    if (amount < 10) { alert("⚠️ Số tiền rút tối thiểu là $10"); return; } 
    if (amount > wallet.available) { alert("⚠️ Số dư không đủ!"); return; }
    
    if (!profile?.bankInfo && !profile?.cryptoInfo) {
        alert("⚠️ Vui lòng cập nhật Ví nhận tiền trong phần Cài đặt trước!");
        return;
    }

    if(!confirm(`Xác nhận rút $${amount} về ví của bạn?`)) return;

    try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            "wallet.available": Number((wallet.available - amount).toFixed(2)), 
            "wallet.pending": Number((wallet.pending + amount).toFixed(2))      
        });
        alert("✅ Yêu cầu rút tiền đã được gửi! Admin sẽ duyệt trong 24h.");
    } catch (e) {
        console.error(e);
        alert("❌ Lỗi kết nối! Vui lòng thử lại sau.");
    }
  };

  // REALTIME DATA
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

  if (!profile && user) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-blue-500 font-mono text-sm tracking-widest animate-pulse">
        :: THIẾT LẬP KẾT NỐI ::
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans selection:bg-blue-500/30 pb-20 relative overflow-x-hidden">
      
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* TOP NAVIGATION BAR */}
      <nav className="border-b border-slate-800 bg-[#0B1120]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">
            
            <div className="flex items-center gap-4">
                 <Link href="/" className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center font-black italic text-white shadow-sm">S</div>
                    <div className="hidden sm:block">
                        <div className="font-bold text-lg text-white tracking-tight leading-none">SPARTAN</div>
                        <div className="text-[9px] text-blue-500 tracking-[0.2em] font-bold uppercase mt-0.5">Trading System</div>
                    </div>
                 </Link>
                 
                 {/* Badge Rank */}
                 <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${rank.bg} border-transparent ${rank.color}`}>
                    <RankIcon size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{rank.title}</span>
                 </div>
            </div>

            <div className="flex items-center gap-5">
                {profile?.mt5Account && isAccountActive && (
                    <div className="hidden lg:flex items-center gap-6 mr-2">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">BALANCE</span>
                            <span className="text-sm font-mono text-emerald-400 font-bold">${botData?.balance?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="h-6 w-px bg-slate-700"></div>
                         <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">PROFIT</span>
                            <span className={`text-sm font-mono font-bold ${botData?.floatingProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {botData?.floatingProfit > 0 ? '+' : ''}{botData?.floatingProfit?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </div>
                )}
                <button onClick={() => logout()} className="flex items-center gap-2 text-slate-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Đăng xuất">
                    <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider">Thoát</span>
                    <LogOut size={18} />
                </button>
            </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 relative z-10">
        
        {!isAccountActive ? (
             <div className="mt-8 max-w-2xl mx-auto">
                <VerificationLock user={user} profile={profile} />
             </div>
        ) : (
            <>
                {/* HỆ THỐNG TABS */}
                <div className="flex flex-col md:flex-row border-b border-slate-800 bg-[#111827] md:bg-transparent rounded-t-xl overflow-hidden md:overflow-visible">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutGrid size={16}/>} label="TỔNG QUAN" />
                    <TabButton active={activeTab === 'war-room'} onClick={() => setActiveTab('war-room')} icon={<Radar size={16}/>} label="CHIẾN TRƯỜNG" hasLiveBadge={true} />
                    {isLifetime && ( <TabButton active={activeTab === 'partner'} onClick={() => setActiveTab('partner')} icon={<Users size={16}/>} label="ĐỐI TÁC" /> )}
                </div>

                {/* CONTENT AREA */}
                <div className="min-h-[500px]">
                    {activeTab === 'overview' && ( <OverviewTab profile={profile} botData={botData} isExpired={isExpired} formatExpiryDate={formatExpiryDate} onOpenPay={(plan: string) => { setSelectedPlan(plan); setIsPayOpen(true); }} onOpenGuide={() => setIsGuideOpen(true)} /> )}
                    {activeTab === 'war-room' && ( <WarRoomTab trades={trades} accountInfo={botData} /> )}
                    {activeTab === 'partner' && isLifetime && ( <PartnerTab wallet={wallet} profile={profile} onWithdraw={handleWithdrawRequest} user={user} /> )}
                </div>
            </>
        )}
      </div>

      {/* MODALS */}
      <PaymentModal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} plan={selectedPlan} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-blue-500 font-mono text-sm tracking-widest">ĐANG TẢI DỮ LIỆU...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
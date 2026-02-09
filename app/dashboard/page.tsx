"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '@/lib/firebase'; 
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore'; 
import { LogOut, Home, Wallet, Zap, LayoutGrid, Radar, Users } from 'lucide-react';

// 👇 IMPORT CÁC MODULE ĐÃ TÁCH
import PaymentModal from '@/components/landing/PaymentModal';
import { VerificationLock } from '@/components/dashboard/onboarding/VerificationLock';
import { TabButton } from '@/components/dashboard/shared/TabButton';
import { GuideModal } from '@/components/dashboard/modals/GuideModal';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { WarRoomTab } from '@/components/dashboard/tabs/WarRoomTab';
import { PartnerTab } from '@/components/dashboard/tabs/PartnerTab';

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

  if (!profile && user) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-green-500">LOADING DATA...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-green-500/30 pb-20">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 font-black text-xl italic text-green-500 tracking-tighter">SPARTAN <span className="text-white opacity-50 underline decoration-green-500">CMD</span></div>
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors text-xs font-bold uppercase tracking-widest group"><Home size={14} /> <span className="hidden sm:inline">{t.dashboard.home}</span></Link>
        </div>
        {profile?.mt5Account && isAccountActive && (
             <div className="hidden md:flex items-center gap-4 bg-slate-950 py-1.5 px-4 rounded-full border border-slate-800 shadow-inner">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Wallet size={12} className="text-yellow-500"/> Bal: <span className="text-white font-mono">${botData?.balance?.toFixed(2) || '0.00'}</span></div>
                 <div className="w-[1px] h-3 bg-slate-800"></div>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Zap size={12} className={botData?.floatingProfit >= 0 ? "text-green-500" : "text-red-500"}/> Float: <span className={`font-mono ${botData?.floatingProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{botData?.floatingProfit > 0 ? '+' : ''}{botData?.floatingProfit?.toFixed(2) || '0.00'}</span></div>
             </div>
        )}
        <button onClick={() => logout()} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold text-xs bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700"><LogOut size={16} /> <span className="hidden sm:inline">{t.dashboard.logout}</span></button>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        {!isAccountActive ? (
            <VerificationLock user={user} profile={profile} />
        ) : (
            <>
                <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit mx-auto md:mx-0 shadow-lg">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutGrid size={18}/>} label="Tổng Quan" />
                    <TabButton active={activeTab === 'war-room'} onClick={() => setActiveTab('war-room')} icon={<Radar size={18}/>} label="Chiến Trường" badge="LIVE"/>
                    <TabButton active={activeTab === 'partner'} onClick={() => setActiveTab('partner')} icon={<Users size={18}/>} label="Đối Tác" />
                </div>

                {activeTab === 'overview' && (
                    <OverviewTab profile={profile} botData={botData} isExpired={isExpired} formatExpiryDate={formatExpiryDate} onOpenPay={(plan: string) => { setSelectedPlan(plan); setIsPayOpen(true); }} onOpenGuide={() => setIsGuideOpen(true)} />
                )}
                {activeTab === 'war-room' && (<WarRoomTab trades={trades} />)}
                {activeTab === 'partner' && (<PartnerTab wallet={wallet} profile={profile} onWithdraw={handleWithdrawRequest} user={user} />)}
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
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-green-500 font-black italic">INITIALIZING...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
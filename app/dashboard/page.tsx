"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LogOut, Copy, Check, CreditCard, Activity, Clock, ShieldCheck, Zap, 
  Home, ChevronLeft, Terminal, PlayCircle, Users, TrendingUp, DollarSign,
  LayoutDashboard, Menu, X, Lock, Wallet, CheckCircle, Share2, Globe, FileText
} from 'lucide-react';
import PaymentModal from '@/components/landing/PaymentModal';

// --- 1. COMPONENT CON: KHU VỰC RESELLER (FINAL VERSION) ---
const ResellerSection = ({ wallet, profile, onWithdraw }: { wallet: any, profile: any, onWithdraw: () => void }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAd, setCopiedAd] = useState(false);

  // Link giới thiệu
  const refLink = `https://spartan-bot.com/?ref=${profile?.licenseKey}`;
  
  // Mẫu quảng cáo
  const adText = `🔥 SPARTAN BOT V7.3 - CỖ MÁY IN TIỀN XAUUSD 🔥\n✅ Lợi nhuận 15-30%/tháng\n✅ Tự động 100%, Không gồng lỗ\n✅ Bảo hiểm vốn 100%\n👉 Nhận Bot miễn phí tại: ${refLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyAd = () => {
    navigator.clipboard.writeText(adText);
    setCopiedAd(true);
    setTimeout(() => setCopiedAd(false), 2000);
  };

  // Tính tổng hoa hồng đã nhận (Chỉ tính trạng thái approved)
  const totalCommission = profile?.referrals?.reduce((sum: number, item: any) => {
      return item.status === 'approved' ? sum + (item.commission || 0) : sum;
  }, 0) || 0;

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 mt-6">
      
      {/* HEADER: AGENCY STATUS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
         <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
               <ShieldCheck className="text-yellow-500" /> SPARTAN AGENCY
            </h2>
            <p className="text-sm text-slate-400 mt-1">Cấp bậc: <span className="text-yellow-500 font-bold">COMMANDER (40% Hoa hồng)</span></p>
         </div>
         <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-3">
            <Globe size={16} className="text-green-500"/>
            <span className="text-xs text-slate-400">Mã giới thiệu:</span>
            <span className="text-sm font-mono font-bold text-white select-all">{profile?.licenseKey}</span>
         </div>
      </div>

      {/* 1. VÍ TIỀN (WALLET DASHBOARD) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Tiền khả dụng */}
          <div className="bg-gradient-to-br from-green-900/40 to-slate-900 border border-green-500/50 p-6 rounded-[2rem] relative overflow-hidden group hover:border-green-400 transition-colors">
              <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet size={100}/>
              </div>
              <p className="text-[10px] text-green-400 font-black uppercase mb-2 flex items-center gap-2 tracking-widest"><CheckCircle size={12}/> Số dư khả dụng</p>
              <h2 className="text-4xl font-black text-white font-chakra mb-6">${wallet.available.toFixed(2)}</h2>
              <button 
                  onClick={onWithdraw} 
                  className="w-full py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-900/50 active:scale-95 transition-all"
              >
                  RÚT TIỀN NGAY
              </button>
          </div>

          {/* Card 2: Tiền chờ duyệt (Pending rút) */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem]">
              <p className="text-[10px] text-yellow-500 font-black uppercase mb-2 flex items-center gap-2 tracking-widest"><Clock size={12}/> Đang chờ xử lý</p>
              <h2 className="text-4xl font-black text-slate-300 font-chakra mb-2">${wallet.pending.toFixed(2)}</h2>
              <p className="text-[10px] text-slate-500 italic">*Lệnh rút tiền đang được kế toán kiểm tra.</p>
          </div>

          {/* Card 3: Tổng quan Team */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem]">
              <p className="text-[10px] text-slate-400 font-black uppercase mb-2 flex items-center gap-2 tracking-widest"><Users size={12}/> Tổng thành viên</p>
              <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-black text-slate-300 font-chakra mb-2">{profile?.referrals?.length || 0}</h2>
                  <span className="text-xs text-slate-500">người</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">Tổng hoa hồng kiếm được:</span>
                  <span className="text-sm font-bold text-green-500">+${totalCommission.toFixed(2)}</span>
              </div>
          </div>
      </div>

      {/* 2. MARKETING TOOLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Link Giới thiệu */}
         <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase"><Share2 size={16} className="text-blue-500"/> Link Giới thiệu</h3>
            <div className="bg-black/50 p-3 rounded-xl border border-slate-700 flex items-center gap-2 mb-3">
               <span className="text-xs text-slate-400 truncate flex-1 font-mono select-all">{refLink}</span>
               <button onClick={handleCopyLink} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-white transition-colors">
                  {copiedLink ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
               </button>
            </div>
            <p className="text-[10px] text-slate-500">Gửi link này cho khách hàng. Hệ thống tự động ghi nhận hoa hồng khi khách thanh toán.</p>
         </div>

         {/* Mẫu Quảng Cáo */}
         <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase"><FileText size={16} className="text-purple-500"/> Content Mẫu</h3>
            <div className="bg-black/50 p-3 rounded-xl border border-slate-700 relative group h-24 overflow-hidden">
               <p className="text-[10px] text-slate-300 whitespace-pre-line font-mono">{adText}</p>
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={handleCopyAd} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded font-bold shadow-lg">Sao chép bài đăng</button>
               </div>
            </div>
         </div>
      </div>
      
      {/* 3. BẢNG LỊCH SỬ HOA HỒNG (CỐT LÕI) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-8">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-sm tracking-wider"><CreditCard size={16} className="text-green-500"/> LỊCH SỬ KHÁCH HÀNG & HOA HỒNG</h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-xs text-left text-slate-400">
                <thead className="text-slate-500 uppercase font-black border-b border-slate-800">
                   <tr>
                       <th className="py-4 pl-4">Thời gian</th>
                       <th className="py-4">Khách hàng</th>
                       <th className="py-4">Gói Mua</th>
                       <th className="py-4 text-right">Hoa hồng (40%)</th>
                       <th className="py-4 text-center pr-4">Trạng thái</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                   {(!profile?.referrals || profile.referrals.length === 0) ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-600 italic">Chưa có dữ liệu. Hãy chia sẻ link ngay!</td></tr>
                   ) : (
                      // Đảo ngược mảng để cái mới nhất lên đầu
                      [...profile.referrals].reverse().map((ref: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                           <td className="py-4 pl-4 font-mono text-slate-500">{ref.date}</td>
                           <td className="py-4 font-bold text-white">{ref.user}</td>
                           <td className="py-4">
                               <span className={`px-2 py-1 rounded border text-[10px] font-bold ${
                                   ref.package === 'LIFETIME' ? 'bg-purple-900/30 border-purple-500/50 text-purple-400' :
                                   ref.package === 'YEARLY' ? 'bg-amber-900/30 border-amber-500/50 text-amber-400' :
                                   ref.status === 'pending' ? 'bg-slate-800 border-slate-700 text-slate-400' : 
                                   'bg-blue-900/30 border-blue-500/50 text-blue-400'
                               }`}>
                                   {ref.package}
                               </span>
                           </td>
                           <td className="py-4 text-right font-bold text-green-400">
                               {ref.commission > 0 ? `+$${ref.commission}` : '--'}
                           </td>
                           <td className="py-4 text-center pr-4">
                              {ref.status === 'approved' 
                                ? <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded font-bold border border-green-500/20 text-[10px]">ĐÃ NHẬN</span>
                                : <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded font-bold border border-yellow-500/20 text-[10px]">CHỜ THANH TOÁN</span>
                              }
                           </td>
                        </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};

// --- 2. NỘI DUNG CHÍNH (DASHBOARD CONTENT) ---
function DashboardContent() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage(); 
  const searchParams = useSearchParams();
  
  const [copied, setCopied] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [activeTab, setActiveTab] = useState("overview"); 
  
  // Wallet lấy từ profile
  const wallet = profile?.wallet || { available: 0, pending: 0, total_paid: 0 };

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

  const handleWithdrawRequest = async () => {
    const amountStr = prompt(`Nhập số tiền muốn rút (Tối đa: $${wallet.available}):`); 
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
        alert("Số tiền không hợp lệ");
        return;
    }
    if (amount > wallet.available) {
        alert("Số dư không đủ!");
        return;
    }

    try {
        const res = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: user.email, 
                amount: amount 
            })
        });
        const data = await res.json();
        alert(data.message);
    } catch (e) {
        alert("Lỗi kết nối Server!");
    }
  };

  if (!profile && user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-green-500">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black tracking-[0.3em] uppercase animate-pulse text-sm">
          {t.dashboard.loading || "LOADING DATA..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-green-500/30 pb-20">
      
      {/* NAVBAR */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 font-black text-xl italic text-green-500 tracking-tighter">
            SPARTAN <span className="text-white opacity-50 underline decoration-green-500">CMD</span>
          </div>

          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors text-xs font-bold uppercase tracking-widest group">
            <div className="p-1 rounded-full border border-slate-700 group-hover:border-green-500 transition-colors"><ChevronLeft size={12} /></div>
            <Home size={14} /> <span className="hidden sm:inline">{t.dashboard.home}</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
             {/* MENU SWITCHER (CHỈ HIỆN CHO LIFETIME) */}
             {profile?.plan === 'LIFETIME' && (
                 <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                     <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}
                     >
                        <LayoutDashboard size={14}/> <span className="hidden sm:inline">Tổng quan</span>
                     </button>
                     <button 
                        onClick={() => setActiveTab('reseller')}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'reseller' ? 'bg-green-600 text-black shadow' : 'text-slate-500 hover:text-white'}`}
                     >
                        <DollarSign size={14}/> <span className="hidden sm:inline">Đối tác</span>
                     </button>
                 </div>
             )}

            <button onClick={() => logout()} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold text-xs bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 hover:border-red-500/30">
              <LogOut size={16} /> <span className="hidden sm:inline">{t.dashboard.logout}</span>
            </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
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
            {profile?.plan !== "free" && (
              <button onClick={() => { setSelectedPlan(profile?.plan || "monthly"); setIsPayOpen(true); }} className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-700 transition-all border border-slate-700 active:scale-95 group">
                <CreditCard size={16} className="group-hover:rotate-12 transition-transform" /> {t.dashboard.btn.renew}
              </button>
            )}
            <button onClick={() => { setSelectedPlan("starter"); setIsPayOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-400 text-black font-black text-sm rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
              <Zap size={18} fill="currentColor" /> {t.dashboard.btn.upgrade}
            </button>
          </div>
        </div>

        {/* --- LOGIC HIỂN THỊ TAB --- */}
        {activeTab === 'overview' ? (
            <>
                {/* 1. LICENSE CARD */}
                <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-colors">
                  <div className="relative z-10">
                    <h3 className="text-slate-500 font-bold uppercase text-[10px] mb-4 tracking-[0.2em] flex items-center gap-2">
                      <Activity size={12} className="text-green-500"/> {t.dashboard.license.title}
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                      <code className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter break-all select-all">
                        {profile?.licenseKey || "LOADING..."}
                      </code>
                      <button onClick={handleCopy} className="bg-white text-black px-6 py-3 rounded-xl font-black hover:bg-green-500 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 shadow-lg w-fit">
                        {copied ? <Check size={18} className="text-green-700" /> : <Copy size={18}/>} 
                        {copied ? t.dashboard.btn.copied : t.dashboard.btn.copy}
                      </button>
                    </div>
                    <p className="text-slate-500 text-xs italic mt-4">{t.dashboard.license.note}</p>
                  </div>
                  <div className="absolute -right-20 -top-20 w-80 h-80 bg-green-500/5 blur-[100px] group-hover:bg-green-500/10 transition-all duration-700"></div>
                </div>

                {/* 2. DOWNLOAD SECTION */}
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
                    <a href="https://docs.google.com/uc?export=download&id=1BGtSMioGSIk-kkSrhmvipGW1gTg4LHTQ" className="relative z-10 flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl transition-all hover:scale-105 shadow-lg active:scale-95 group w-full md:w-auto justify-center">
                      <Zap size={20} fill="currentColor" className="group-hover:animate-bounce" /> {t.dashboard.btn.download}  
                    </a>
                  </div>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] text-center flex flex-col items-center gap-4">
                    <Lock size={40} className="text-slate-600"/>
                    <div>
                        <p className="text-slate-500 font-bold mb-1">{t.dashboard.download.locked}</p>
                        <p className="text-xs text-slate-600">Nâng cấp gói để mở khóa kho vũ khí.</p>
                    </div>
                  </div>
                )}

                {/* 3. STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatBox label={t.dashboard.stats.account} value={profile?.mt5Account || t.dashboard.status.unconnected} icon={<Activity size={18}/>} />
                  <StatBox label={t.dashboard.stats.expiry} value={formatExpiryDate()} icon={<Clock size={18}/>} color={isExpired ? "text-red-500 animate-pulse font-black" : "text-blue-400"} />
                  <StatBox label={t.dashboard.stats.rank} value={profile?.plan === "starter" ? "PRO" : profile?.plan === "yearly" ? "VIP YEARLY" : profile?.plan === "LIFETIME" ? "VIP LIFETIME" : "FREE"} icon={<ShieldCheck size={18}/>} color={profile?.plan === "starter" ? "text-green-400" : "text-amber-400"} />
                </div>

                {/* 4. GUIDE */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <Terminal size={20} className="text-green-500" /> {t.dashboard.guide.title}
                  </h3>
                  <div className="space-y-6">
                    <Step num="01" title={t.dashboard.guide.step1_title} desc={t.dashboard.guide.step1_desc} />
                    <Step num="02" title={t.dashboard.guide.step2_title} desc={t.dashboard.guide.step2_desc} code="https://spartan-web-auto-bot-trading.vercel.app/" />
                    <Step num="03" title={t.dashboard.guide.step3_title} desc={t.dashboard.guide.step3_desc} />
                  </div>
                </div>
            </>
        ) : (
            // --- TAB RESELLER (Chỉ hiện khi LIFETIME) ---
            <ResellerSection wallet={wallet} profile={profile} onWithdraw={handleWithdrawRequest} />
        )}
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
        {code && <div className="bg-black/50 p-2 rounded border border-slate-700 font-mono text-green-400 text-xs inline-block break-all select-all">{code}</div>}
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
"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// 👇 1. IMPORT FIREBASE
import { db } from '@/lib/firebase'; 
import { doc, getDoc, updateDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore'; 

// 👇 2. IMPORT ICON
import { 
  LogOut, Copy, Check, CreditCard, Activity, Clock, ShieldCheck, Zap, 
  Home, Users, TrendingUp, DollarSign, LayoutDashboard, Lock, Wallet, 
  CheckCircle, Share2, Globe, FileText, Settings, Save, Bitcoin, 
  ChevronDown, List, AlertTriangle, Send, ExternalLink, Download
} from 'lucide-react';
import PaymentModal from '@/components/landing/PaymentModal';

// 🏦 DANH SÁCH NGÂN HÀNG
const VN_BANKS = [
    "Vietcombank (VCB)", "MBBank (Quân Đội)", "Techcombank (TCB)", "ACB (Á Châu)",
    "VietinBank (CTG)", "BIDV (Đầu tư & PT)", "VPBank", "TPBank", "Sacombank", "VIB", "HDBank",
    "MSB", "OCB", "SHB", "Eximbank", "SeABank", "ABBank", "Nam A Bank", "Agribank"
];

// --- 1. COMPONENT MỚI: MÀN HÌNH KHÓA (ONBOARDING) ---
const VerificationLock = ({ user, profile }: { user: any, profile: any }) => {
  const [mt5Input, setMt5Input] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'new' | 'pending' | 'rejected'>('new');

  // Xác định trạng thái dựa trên profile
  useEffect(() => {
    if (profile?.accountStatus) {
      setStatus(profile.accountStatus);
    } else if (profile?.mt5Account) {
      // Nếu có MT5 mà không có status -> Coi như đang chờ (để tương thích dữ liệu cũ)
      setStatus('pending');
    }
  }, [profile]);

  const handleSubmitMT5 = async () => {
    if (!mt5Input || mt5Input.length < 5) {
      alert("Vui lòng nhập đúng ID MT5!");
      return;
    }
    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        mt5Account: parseInt(mt5Input), // Lưu số tài khoản
        accountStatus: 'pending',       // Đặt trạng thái chờ duyệt
        submittedAt: new Date().toISOString()
      });
      setStatus('pending');
      alert("✅ Đã gửi yêu cầu! Vui lòng chờ Admin duyệt.");
    } catch (error) {
      alert("Lỗi hệ thống! Thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // LINK ĐĂNG KÝ CỦA ĐẠI TÁ (THAY LINK CỦA ĐẠI TÁ VÀO ĐÂY)
  const REG_LINK = "https://one.exnessonelink.com/a/t7uxs4x192/?campaign=38979"; 
  const TELEGRAM_ADMIN = "https://t.me/MyGold_M15_Bot"; // Link Telegram của Đại tá

  // GIAO DIỆN CHỜ DUYỆT (PENDING)
  if (status === 'pending') {
    return (
      <div className="bg-slate-900 border border-yellow-600/50 p-8 rounded-[2rem] text-center max-w-2xl mx-auto mt-10 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <Clock size={40} className="text-yellow-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase">HỒ SƠ ĐANG ĐƯỢC DUYỆT</h2>
        <p className="text-slate-400 mb-6">
          Admin đang kiểm tra tài khoản MT5 <span className="text-white font-mono font-bold">{profile?.mt5Account}</span> của bạn.
          <br/>Quy trình này thường mất từ 15-30 phút.
        </p>
        
        <div className="bg-black/40 p-4 rounded-xl border border-slate-800 mb-6 text-sm text-slate-300">
          ⚠️ <span className="font-bold text-yellow-500">Lưu ý:</span> Nếu bạn chưa đăng ký qua Link giới thiệu hoặc không phải tài khoản <span className="font-bold text-white">Zero/Raw</span>, yêu cầu sẽ bị từ chối.
        </div>

        <a href={TELEGRAM_ADMIN} target="_blank" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
          <Send size={18} /> NHẮN ADMIN DUYỆT NHANH
        </a>
        
        <p className="mt-4 text-xs text-slate-600 cursor-pointer hover:text-red-500" onClick={() => setStatus('new')}>
           (Debug: Quay lại bước nhập - Chỉ hiện lúc test)
        </p>
      </div>
    );
  }

  // GIAO DIỆN BỊ TỪ CHỐI (REJECTED)
  if (status === 'rejected') {
    return (
      <div className="bg-slate-900 border border-red-600/50 p-8 rounded-[2rem] text-center max-w-2xl mx-auto mt-10">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <X size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-red-500 mb-2 uppercase">YÊU CẦU BỊ TỪ CHỐI</h2>
        <p className="text-slate-400 mb-6">
          Tài khoản MT5 của bạn không hợp lệ hoặc không nằm trong hệ thống IB.
        </p>
        <button onClick={() => setStatus('new')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
           THỬ LẠI
        </button>
      </div>
    );
  }

  // GIAO DIỆN NGƯỜI MỚI (NEW)
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 italic tracking-tighter">KÍCH HOẠT <span className="text-green-500">SPARTAN BOT</span></h1>
        <p className="text-slate-400">Hoàn thành 2 bước dưới đây để nhận Bot và hướng dẫn sử dụng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* BƯỚC 1 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-green-500/50 transition-all">
          <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-xs font-black px-3 py-1 rounded-bl-xl">BƯỚC 1</div>
          <div className="mb-4 text-green-500"><Users size={40} /></div>
          <h3 className="text-xl font-black text-white mb-2">ĐĂNG KÝ TÀI KHOẢN</h3>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Bắt buộc đăng ký tài khoản Exness qua link hoặc code mã đối tác 
            <a href={REG_LINK} target="_blank" className="text-green-400 font-bold mx-1 hover:underline">
            <span className="text-yellow-400 font-bold">t7uxs4x192</span>
            </a>để hệ thống tự động nhận diện và kích hoạt Bot. Đây là quy định
             độc quyền để được kích hoạt Bot.
          </p>
          <ul className="text-xs text-slate-300 space-y-2 mb-6">
             <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500"/> Backcom <span className="text-yellow-400 font-bold">90%</span> trọn đời.</li>
             <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500"/> Loại tài khoản: <span className="text-white font-bold">Zero</span> hoặc <span className="text-white font-bold">Raw Spread</span>.</li>
             <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500"/> Đòn bẩy: 1:400 trở lên.</li>
          </ul>
          <a href={REG_LINK} target="_blank" className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-900/50 transition-all active:scale-95">
             ĐĂNG KÝ NGAY <ExternalLink size={16}/>
          </a>
        </div>

        {/* BƯỚC 2 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-xs font-black px-3 py-1 rounded-bl-xl">BƯỚC 2</div>
          <div className="mb-4 text-blue-500"><ShieldCheck size={40} /></div>
          <h3 className="text-xl font-black text-white mb-2">XÁC MINH ID</h3>
          <p className="text-sm text-slate-400 mb-4">
            Nhập ID tài khoản MT5 (Zero/Raw) bạn vừa tạo để hệ thống kiểm tra.
          </p>
          
          <div className="space-y-4">
            <input 
              type="number" 
              placeholder="Nhập ID MT5 (Ví dụ: 12345678)" 
              className="w-full bg-black/50 border border-slate-700 rounded-xl p-4 text-white font-mono focus:border-blue-500 outline-none transition-colors"
              value={mt5Input}
              onChange={(e) => setMt5Input(e.target.value)}
            />
            <button 
              onClick={handleSubmitMT5}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-all active:scale-95"
            >
              {isSubmitting ? "ĐANG GỬI..." : "GỬI XÁC MINH"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CON: KHU VỰC RESELLER (GIỮ NGUYÊN) ---
const ResellerSection = ({ wallet, profile, onWithdraw, user }: { wallet: any, profile: any, onWithdraw: () => void, user: any }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAd, setCopiedAd] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'bank' | 'crypto'>('bank');
  const [bankInfo, setBankInfo] = useState({ bankName: "", accountNumber: "", accountHolder: "" });
  const [cryptoInfo, setCryptoInfo] = useState({ network: "USDT (TRC20)", walletAddress: "" });

  const refLink = `https://spartan-web-auto-bot-trading.vercel.app/?ref=${profile?.licenseKey}`;
  const adText = `🔥 SPARTAN BOT V7.3 - CỖ MÁY IN TIỀN XAUUSD 🔥\n✅ Lợi nhuận 15-30%/tháng\n✅ Tự động 100%, Không gồng lỗ\n✅ Bảo hiểm vốn 100%\n👉 Nhận Bot miễn phí tại: ${refLink}`;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.bankInfo) setBankInfo(data.bankInfo);
          if (data.cryptoInfo) {
              setCryptoInfo(data.cryptoInfo);
              if (!data.bankInfo?.accountNumber && data.cryptoInfo?.walletAddress) setActiveTab('crypto');
          }
        }
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, [user]);

  const savePaymentInfo = async () => {
    if (!user) return;
    try {
        const userRef = doc(db, "users", user.uid);
        if (activeTab === 'bank') {
            if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) { alert("⚠️ Vui lòng điền đủ thông tin!"); return; }
            await updateDoc(userRef, { bankInfo: bankInfo });
            alert("✅ Đã lưu thông tin Ngân hàng!");
        } else {
            if (!cryptoInfo.walletAddress) { alert("⚠️ Vui lòng nhập địa chỉ ví!"); return; }
            await updateDoc(userRef, { cryptoInfo: cryptoInfo });
            alert("✅ Đã lưu thông tin ví Crypto!");
        }
        setShowSettingsModal(false);
    } catch (error) { alert("❌ Lỗi hệ thống, thử lại sau."); }
  };

  const handleCopyLink = () => { navigator.clipboard.writeText(refLink); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); };
  const handleCopyAd = () => { navigator.clipboard.writeText(adText); setCopiedAd(true); setTimeout(() => setCopiedAd(false), 2000); };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 mt-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
         <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2"><ShieldCheck className="text-yellow-500" /> SPARTAN AGENCY</h2>
            <p className="text-sm text-slate-400 mt-1">Cấp bậc: <span className="text-yellow-500 font-bold">COMMANDER (40% Hoa hồng)</span></p>
         </div>
         <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-3">
            <Globe size={16} className="text-green-500"/>
            <span className="text-xs text-slate-400">Mã giới thiệu:</span>
            <span className="text-sm font-mono font-bold text-white select-all">{profile?.licenseKey}</span>
         </div>
      </div>
      {/* VÍ TIỀN & FORM SETTINGS (GIỮ NGUYÊN CODE CŨ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-900/40 to-slate-900 border border-green-500/50 p-6 rounded-[2rem] relative overflow-hidden group hover:border-green-400 transition-colors">
              <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet size={100}/></div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                  <p className="text-[10px] text-green-400 font-black uppercase flex items-center gap-2 tracking-widest"><CheckCircle size={12}/> Số dư khả dụng</p>
                  <button onClick={() => setShowSettingsModal(true)} className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800"><Settings size={16} /></button>
              </div>
              <h2 className="text-4xl font-black text-white font-chakra mb-2 relative z-10">${wallet.available.toFixed(2)}</h2>
              <div className="relative z-10 min-h-[20px] mb-4">
                  {cryptoInfo.walletAddress ? (
                      <p className="text-[10px] text-green-400 font-mono truncate flex items-center gap-1"><Bitcoin size={12} /> {cryptoInfo.network}: {cryptoInfo.walletAddress.substring(0, 6)}...{cryptoInfo.walletAddress.slice(-4)}</p>
                  ) : bankInfo.accountNumber ? (
                      <p className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1"><CreditCard size={12} /> {bankInfo.bankName.split('(')[0]} • {bankInfo.accountNumber}</p>
                  ) : (<p className="text-[10px] text-slate-500 italic">Chưa cài đặt ví nhận tiền</p>)}
              </div>
              <button onClick={onWithdraw} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-900/50 active:scale-95 transition-all mt-auto relative z-10">RÚT TIỀN NGAY</button>
          </div>
          {/* ... Các card khác (pending, members) giữ nguyên ... */}
      </div>

      {/* MARKETING TOOLS (GIỮ NGUYÊN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase"><Share2 size={16} className="text-blue-500"/> Link Giới thiệu</h3>
            <div className="bg-black/50 p-3 rounded-xl border border-slate-700 flex items-center gap-2 mb-3">
               <span className="text-xs text-slate-400 truncate flex-1 font-mono select-all">{refLink}</span>
               <button onClick={handleCopyLink} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-white transition-colors">{copiedLink ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}</button>
            </div>
         </div>
         <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase"><FileText size={16} className="text-purple-500"/> Content Mẫu</h3>
            <div className="bg-black/50 p-3 rounded-xl border border-slate-700 relative group h-24 overflow-hidden">
               <p className="text-[10px] text-slate-300 whitespace-pre-line font-mono">{adText}</p>
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={handleCopyAd} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded font-bold shadow-lg">Sao chép</button>
               </div>
            </div>
         </div>
      </div>
      
      {/* MODAL SETTINGS (GIỮ NGUYÊN) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6"><Settings className="text-green-500" /> CÀI ĐẶT VÍ</h3>
            <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
                <button onClick={() => setActiveTab('bank')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${activeTab === 'bank' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Ngân hàng</button>
                <button onClick={() => setActiveTab('crypto')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${activeTab === 'crypto' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>Crypto</button>
            </div>
            <div className="space-y-4">
                {activeTab === 'bank' ? (
                    <>
                        <select value={bankInfo.bankName} onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white">
                            <option value="" disabled>-- Chọn ngân hàng --</option>
                            {VN_BANKS.map((bank, idx) => <option key={idx} value={bank}>{bank}</option>)}
                        </select>
                        <input type="text" value={bankInfo.accountNumber} onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})} placeholder="Số tài khoản" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
                        <input type="text" value={bankInfo.accountHolder} onChange={(e) => setBankInfo({...bankInfo, accountHolder: e.target.value.toUpperCase()})} placeholder="Tên chủ tài khoản" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white uppercase" />
                    </>
                ) : (
                    <>
                        <input type="text" value={cryptoInfo.walletAddress} onChange={(e) => setCryptoInfo({...cryptoInfo, walletAddress: e.target.value})} placeholder="Địa chỉ ví TRC20" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs" />
                    </>
                )}
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowSettingsModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800">Hủy</button>
              <button onClick={savePaymentInfo} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500">LƯU</button>
            </div>
          </div>
        </div>
      )}
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
  const [botData, setBotData] = useState<any>(null); 
  const [trades, setTrades] = useState<any[]>([]);

  const wallet = profile?.wallet || { available: 0, pending: 0, total_paid: 0 };

  // 🛡️ LOGIC KIỂM TRA TRẠNG THÁI TÀI KHOẢN (ĐÃ DUYỆT HAY CHƯA)
  // Nếu chưa được duyệt -> Hiện màn hình khóa (VerificationLock)
  const isAccountActive = profile?.accountStatus === 'active'; 

  // 🎧 LẮNG NGHE BOT (Chỉ chạy khi đã Active)
  useEffect(() => {
    if (!profile?.mt5Account || !isAccountActive) return; 
    const unsub = onSnapshot(doc(db, "bots", profile.mt5Account.toString()), (doc) => {
      if (doc.exists()) { setBotData(doc.data()); }
    });
    return () => unsub(); 
  }, [profile?.mt5Account, isAccountActive]);

  // 🎧 LẮNG NGHE LỊCH SỬ GIAO DỊCH (Chỉ chạy khi đã Active)
  useEffect(() => {
    if (!profile?.mt5Account || !isAccountActive) return;
    const q = query(collection(db, "bots", profile.mt5Account.toString(), "trades"), orderBy("timestamp", "desc"), limit(10));
    const unsub = onSnapshot(q, (snapshot) => { setTrades(snapshot.docs.map(doc => doc.data())); });
    return () => unsub();
  }, [profile?.mt5Account, isAccountActive]);

  const formatExpiryDate = () => {
    if (!profile?.expiryDate) return t.dashboard.status.lifetime;
    const seconds = profile.expiryDate.seconds || profile.expiryDate._seconds;
    if (!seconds) return t.dashboard.status.updating;
    return new Date(seconds * 1000).toLocaleDateString('vi-VN');
  };

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

  if (!profile && user) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-green-500">LOADING DATA...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-green-500/30 pb-20">
      {/* NAVBAR */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 font-black text-xl italic text-green-500 tracking-tighter">SPARTAN <span className="text-white opacity-50 underline decoration-green-500">CMD</span></div>
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors text-xs font-bold uppercase tracking-widest group"><Home size={14} /> <span className="hidden sm:inline">{t.dashboard.home}</span></Link>
        </div>
        <div className="flex items-center gap-4">
              {profile?.plan === 'LIFETIME' && isAccountActive && ( // Chỉ hiện Menu khi đã Active
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}><LayoutDashboard size={14}/> <span className="hidden sm:inline">Tổng quan</span></button>
                      <button onClick={() => setActiveTab('reseller')} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'reseller' ? 'bg-green-600 text-black shadow' : 'text-slate-500 hover:text-white'}`}><DollarSign size={14}/> <span className="hidden sm:inline">Đối tác</span></button>
                  </div>
              )}
            <button onClick={() => logout()} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold text-xs bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700"><LogOut size={16} /> <span className="hidden sm:inline">{t.dashboard.logout}</span></button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* 🔥🔥🔥 LOGIC ĐIỀU HƯỚNG MÀN HÌNH 🔥🔥🔥 */}
        {/* Nếu chưa ACTIVE -> Hiện màn hình xác minh */}
        {!isAccountActive ? (
            <VerificationLock user={user} profile={profile} />
        ) : (
            <>
                {/* HEADER (Chỉ hiện khi đã Active) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black mb-3 leading-none tracking-tight">{t.dashboard.welcome}, <br/><span className="text-green-500 uppercase">{user?.displayName?.split(' ')[0] || "SPARTAN"}</span></h1>
                        <div className="flex items-center gap-2"><div className={`w-2 h-2 ${isExpired ? 'bg-red-500' : 'bg-green-500'} rounded-full animate-pulse`}></div><span className={`text-[10px] font-black tracking-widest uppercase ${isExpired ? 'text-red-500' : 'text-slate-400'}`}>{isExpired ? t.dashboard.status.expired : t.dashboard.status.active}</span></div>
                    </div>
                </div>

                {/* NỘI DUNG CHÍNH (TABS) */}
                {activeTab === 'overview' ? (
                    <>
                        {/* REAL-TIME MONITOR */}
                        {profile?.mt5Account && botData ? (
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatBox label="STATUS" icon={<Activity size={14} />} value={(new Date().getTime() - new Date(botData.lastHeartbeat).getTime()) < 120000 ? "ONLINE 🟢" : "OFFLINE 🔴"} color={(new Date().getTime() - new Date(botData.lastHeartbeat).getTime()) < 120000 ? "text-green-400" : "text-red-500"}/>
                            <StatBox label="BALANCE" icon={<Wallet size={14} />} value={`$${botData.balance?.toFixed(2)}`} color="text-yellow-400" />
                            <StatBox label="EQUITY" icon={<TrendingUp size={14} />} value={`$${botData.equity?.toFixed(2)}`} color="text-blue-400" />
                            <StatBox label="FLOATING" icon={<Zap size={14} />} value={`${botData.floatingProfit > 0 ? "+" : ""}${botData.floatingProfit?.toFixed(2)}`} color={botData.floatingProfit >= 0 ? "text-green-500" : "text-red-500"}/>
                        </div>
                        ) : (
                        <div className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-center">
                            <p className="text-slate-400 text-sm">📡 Đang chờ tín hiệu từ Bot MT5...</p>
                            <p className="text-xs text-slate-600 mt-1">Bot chưa kết nối hoặc chưa nhập Key.</p>
                        </div>
                        )}
                        
                        {/* BẢNG LỊCH SỬ GIAO DỊCH */}
                        {trades.length > 0 && (
                        <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-6 md:p-8 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-sm tracking-wider"><List size={16} className="text-blue-500"/> Lịch sử giao dịch (Real-time)</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-slate-400">
                                    <thead className="text-slate-500 uppercase font-black border-b border-slate-800">
                                        <tr><th className="py-3 pl-4">Ticket</th><th className="py-3">Symbol</th><th className="py-3">Type</th><th className="py-3">Time</th><th className="py-3 text-right pr-4">Profit</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {trades.map((trade, idx) => (
                                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors"><td className="py-3 pl-4 font-mono">#{trade.ticket}</td><td className="py-3 font-bold text-white">{trade.symbol}</td><td className="py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{trade.type}</span></td><td className="py-3 text-slate-500">{new Date(trade.time).toLocaleTimeString('vi-VN')}</td><td className={`py-3 text-right pr-4 font-bold font-mono ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        )}

                        {/* LICENSE CARD */}
                        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-colors">
                            <div className="relative z-10">
                                <h3 className="text-slate-500 font-bold uppercase text-[10px] mb-4 tracking-[0.2em] flex items-center gap-2"><Activity size={12} className="text-green-500"/> {t.dashboard.license.title}</h3>
                                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                                    <code className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter break-all select-all">{profile?.licenseKey || "LOADING..."}</code>
                                    <button onClick={handleCopy} className="bg-white text-black px-6 py-3 rounded-xl font-black hover:bg-green-500 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 shadow-lg w-fit">{copied ? <Check size={18} className="text-green-700" /> : <Copy size={18}/>} {copied ? t.dashboard.btn.copied : t.dashboard.btn.copy}</button>
                                </div>
                            </div>
                        </div>

                        {/* DOWNLOAD SECTION (CHỈ HIỆN KHI ĐÃ ACTIVE) */}
                        {profile?.plan && profile?.plan !== "free" ? (
                            <div className="bg-gradient-to-r from-green-900/20 to-slate-900 border border-green-500/30 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(34,197,94,0.05)] relative mt-8">
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="bg-green-500 p-4 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.4)]"><ShieldCheck size={32} className="text-black" /></div>
                                    <div><h3 className="text-xl font-black text-white uppercase tracking-tighter">{t.dashboard.download.title}</h3><p className="text-green-400 text-xs font-bold uppercase tracking-widest mt-1">{t.dashboard.download.unlocked}</p></div>
                                </div>
                                <a href="https://docs.google.com/uc?export=download&id=1BGtSMioGSIk-kkSrhmvipGW1gTg4LHTQ" className="relative z-10 flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl transition-all hover:scale-105 shadow-lg active:scale-95 group w-full md:w-auto justify-center"><Download size={20} fill="currentColor" className="group-hover:animate-bounce" /> {t.dashboard.btn.download}</a>
                            </div>
                        ) : null}

                        {/* STATS & GUIDE */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <StatBox label={t.dashboard.stats.account} value={profile?.mt5Account || t.dashboard.status.unconnected} icon={<Activity size={18}/>} />
                            <StatBox label={t.dashboard.stats.expiry} value={formatExpiryDate()} icon={<Clock size={18}/>} color={isExpired ? "text-red-500 animate-pulse font-black" : "text-blue-400"} />
                            <StatBox label={t.dashboard.stats.rank} value={profile?.plan === "starter" ? "PRO" : profile?.plan === "yearly" ? "VIP YEARLY" : profile?.plan === "LIFETIME" ? "VIP LIFETIME" : "FREE"} icon={<ShieldCheck size={18}/>} color={profile?.plan === "starter" ? "text-green-400" : "text-amber-400"} />
                        </div>
                    </>
                ) : (
                    <ResellerSection wallet={wallet} profile={profile} onWithdraw={handleWithdrawRequest} user={user} />
                )}
            </>
        )}
      </div>

      <PaymentModal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} plan={selectedPlan} />
    </div>
  );
}

// Helper Components
function StatBox({ label, value, icon, color = "text-white" }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm hover:border-slate-700 transition-all group">
      <div className="text-slate-500 text-[10px] font-black mb-3 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-slate-300">{icon} {label}</div>
      <div className={`text-xl font-black tracking-tight truncate ${color}`}>{value}</div>
    </div>
  );
}
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
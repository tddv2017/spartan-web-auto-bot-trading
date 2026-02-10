"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { Loader2, X, Shield, Star, Crown, CheckSquare, Square, FileText, Copy, Check, RefreshCw, CheckCircle, PartyPopper, Zap } from "lucide-react";
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Confetti from 'react-confetti';

const MY_USDT_WALLET = "TXWxf32YxYWZ99J7ZrvD3zBF8NPkPobKGG"; 
const BANK_INFO = { 
  BANK_ID: "ACB", 
  ACCOUNT_NO: "189362839", 
  TEMPLATE: "PRINT", 
  ACCOUNT_NAME: "LE QUOC DUNG" 
};

export default function PaymentModal({ isOpen, onClose, plan: initialPlan }: { isOpen: boolean; onClose: () => void; plan: string }) {
  const { profile, user } = useAuth();
  const { t, language } = useLanguage(); 
  const text = t.payment; 

  // --- STATE QUẢN LÝ GIAO DIỆN ---
  const [currentPlan, setCurrentPlan] = useState(initialPlan || "yearly");
  const [exchangeRate, setExchangeRate] = useState(25500); 
  const [loadingRate, setLoadingRate] = useState(true);
  const [isAgreed, setIsAgreed] = useState(false);
  
  // --- STATE QUẢN LÝ LOGIC ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentReady, setIsPaymentReady] = useState(false); 
  const [isUserConfirmed, setIsUserConfirmed] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(false); 
  const [successType, setSuccessType] = useState<'upgrade' | 'renewal'>('upgrade');
  
  // --- STATE COPY CLIPBOARD ---
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const initialExpiryRef = useRef<number>(0);

  // Danh sách các gói cước
  const plans = [
    { id: "starter", name: "PRO DAILY", price: 30, icon: <Shield size={16}/>, color: "border-blue-500 text-blue-400" },
    { id: "yearly", name: "VIP YEARLY", price: 299, icon: <Star size={16}/>, color: "border-amber-500 text-amber-400" },
    { id: "LIFETIME", name: "LIFETIME", price: 9999, icon: <Crown size={16}/>, color: "border-purple-500 text-purple-400" }
  ];

  // --- 1. LOGIC LẮNG NGHE WEBHOOK (SIÊU NHẸ) ---
  useEffect(() => {
    if (!isOpen || !user || !profile) return;
    if (initialExpiryRef.current === 0) initialExpiryRef.current = profile.expiryDate?.seconds || 0;

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newExpiry = data.expiryDate?.seconds || 0;
        const newPlan = data.plan;

        // Chỉ cần thấy có sự thay đổi là báo thành công ngay
        if (newExpiry > initialExpiryRef.current || newPlan !== profile.plan) {
           setSuccessType(newPlan === profile.plan ? 'renewal' : 'upgrade');
           setIsPaymentReady(true);
        }
      }
    });
    return () => unsub();
  }, [isOpen, user?.uid]);

  // --- 2. XỬ LÝ KHI NGƯỜI DÙNG XÁC NHẬN ---
  useEffect(() => { 
      if (isPaymentReady && isUserConfirmed) {
          setIsProcessing(false);
          setIsSuccess(true); 
      }
  }, [isPaymentReady, isUserConfirmed]);

  // --- 3. RESET TRẠNG THÁI KHI MỞ MODAL ---
  useEffect(() => {
    if (isOpen) {
      setCurrentPlan(initialPlan || "yearly");
      setIsAgreed(false); setIsSuccess(false); setIsPaymentReady(false); setIsUserConfirmed(false); setIsProcessing(false);
      initialExpiryRef.current = profile?.expiryDate?.seconds || 0;
      
      // Lấy tỷ giá nếu là Tiếng Việt
      if (language === 'vi') {
        setLoadingRate(true);
        fetch("https://api.exchangerate-api.com/v4/latest/USD")
          .then(res => res.json())
          .then(data => { if (data.rates?.VND) setExchangeRate(data.rates.VND); })
          .finally(() => setLoadingRate(false));
      } else { setLoadingRate(false); }
    }
  }, [isOpen]);

  const copyToClipboard = (txt: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(txt);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleConfirmPayment = () => {
      setIsUserConfirmed(true);
      if (!isPaymentReady) {
          setIsProcessing(true);
          setTimeout(() => setIsProcessing(false), 30000); // Tự tắt sau 30s để tránh treo
      }
  };

  if (!isOpen || !profile || !text) return null;

  const selectedData = plans.find(p => p.id === currentPlan) || plans[1];
  const amountVND = Math.ceil((selectedData.price * exchangeRate) / 1000) * 1000;
  // Nội dung chuyển khoản: LICENSE_KEY + GÓI (Ví dụ: SPARTAN-ABC12345 YEARLY)
  const transferContent = `${profile.licenseKey} ${selectedData.id.toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl animate-in fade-in duration-300">
      {isSuccess && <Confetti numberOfPieces={500} gravity={0.3} />}
      
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white z-10"><X size={24}/></button>
        
        {isSuccess ? (
            // --- GIAO DIỆN THÀNH CÔNG ---
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-500">
                <div className="w-28 h-28 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                    {successType === 'renewal' ? <RefreshCw size={60} className="text-green-400" /> : <PartyPopper size={60} className="text-yellow-400" />}
                </div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400 mb-2 uppercase tracking-tighter italic">
                    {successType === 'renewal' ? "GIA HẠN THÀNH CÔNG!" : "NÂNG CẤP HOÀN TẤT!"}
                </h2>
                <p className="text-white font-bold text-lg mb-2">Gói <span className="text-yellow-400">{selectedData.name}</span> đã kích hoạt.</p>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-8 w-full">
                    <div className="flex items-center justify-center gap-2 text-green-400 font-mono font-bold">
                        <CheckCircle size={16}/> HỆ THỐNG ĐÃ XÁC NHẬN QUÂN LƯƠNG
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-5 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Crown size={20}/> VÀO CHIẾN TRƯỜNG NGAY
                </button>
            </div>
        ) : (
            // --- GIAO DIỆN THANH TOÁN ---
            <>
                <h2 className="text-2xl font-black text-white mb-6 text-center uppercase tracking-tighter italic">{text.title}</h2>
                
                {/* 1. LƯỚI CHỌN GÓI */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {plans.map((p) => (
                    <button key={p.id} onClick={() => setCurrentPlan(p.id)} className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${currentPlan === p.id ? `${p.color} bg-slate-800 scale-105 shadow-lg` : "border-slate-800 text-slate-500 opacity-50 hover:opacity-100"}`}>
                      {p.icon} 
                      <span className="text-[10px] font-black uppercase">{p.name}</span> 
                      <span className="text-xs font-mono">${p.price}</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-widest flex items-center gap-2">
                    {language === 'vi' ? text.bank_transfer : text.crypto_transfer}
                    {language === 'vi' && <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-green-400 font-mono">1$ ≈ {exchangeRate.toLocaleString()}đ</span>}
                  </div>
                  
                  {/* 2. MÃ QR CODE */}
                  <div className="bg-white p-4 rounded-3xl mb-6 shadow-lg min-h-[200px] flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                    {loadingRate ? <Loader2 className="animate-spin text-green-500" /> : 
                      <img src={language === 'vi' 
                        ? `https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${BANK_INFO.ACCOUNT_NO}-${BANK_INFO.TEMPLATE}.png?amount=${amountVND}&addInfo=${encodeURIComponent(transferContent)}`
                        : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${MY_USDT_WALLET}`} 
                      alt="QR Code" className="w-48 h-48 object-contain" />
                    }
                  </div>

                  {/* 3. THÔNG TIN CHUYỂN KHOẢN CHI TIẾT */}
                  <div className="w-full space-y-3 mb-6">
                    {language === 'vi' ? (
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center relative group">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Chủ tài khoản</p>
                          <p className="text-white font-bold uppercase mb-2">{BANK_INFO.ACCOUNT_NAME}</p>
                          <div className="flex items-center justify-center gap-2 mt-1 cursor-pointer bg-black/40 p-2 rounded-lg border border-slate-700/50 hover:border-blue-500/50 transition-colors" onClick={() => copyToClipboard(BANK_INFO.ACCOUNT_NO, setCopiedAccount)}>
                              <span className="font-mono font-black text-xl text-blue-400 tracking-wider">{BANK_INFO.ACCOUNT_NO}</span>
                              {copiedAccount ? <Check size={16} className="text-green-500"/> : <Copy size={16} className="text-slate-500"/>}
                          </div>
                      </div>
                    ) : (
                      <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex items-center justify-between px-4">
                        <div className="overflow-hidden"><p className="text-[10px] text-slate-500 uppercase">Ví USDT (TRC20)</p><p className="text-xs font-mono text-green-400 truncate">{MY_USDT_WALLET}</p></div>
                        <button onClick={() => copyToClipboard(MY_USDT_WALLET, setCopiedWallet)} className="p-2 text-slate-400 hover:text-white">{copiedWallet ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}</button>
                      </div>
                    )}

                    {/* 4. NỘI DUNG CHUYỂN KHOẢN (QUAN TRỌNG) */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 relative group cursor-pointer hover:border-green-500/30 transition-colors" onClick={() => copyToClipboard(transferContent, setCopiedContent)}>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Nội dung bắt buộc:</p>
                        <div className="flex items-center justify-between bg-black/30 p-2 rounded-lg">
                            <code className="text-lg font-mono font-black text-green-400 tracking-wider">{transferContent}</code>
                            {copiedContent ? <Check size={18} className="text-green-500"/> : <Copy size={18} className="text-slate-600 group-hover:text-white"/>}
                        </div>
                    </div>
                  </div>

                  {/* 5. ĐIỀU KHOẢN */}
                  <div className="flex items-start gap-3 mb-6 w-full p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setIsAgreed(!isAgreed)}>
                    <div className={`mt-0.5 ${isAgreed ? "text-green-500" : "text-slate-600"}`}>{isAgreed ? <CheckSquare size={20} /> : <Square size={20} />}</div>
                    <div className="text-xs text-slate-400 select-none leading-relaxed">{text.agree_text}</div>
                  </div>

                  {/* 6. NÚT XÁC NHẬN */}
                  <button 
                    onClick={handleConfirmPayment} 
                    disabled={(!isAgreed || isProcessing) && !isPaymentReady}
                    className={`w-full py-4 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider
                    ${isPaymentReady 
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse text-white cursor-pointer scale-105 border-2 border-white/20 shadow-green-900/50" 
                        : (isAgreed && !isProcessing ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed")}`}
                  >
                    {isPaymentReady ? (
                        <> <Zap size={24} className="fill-yellow-300 text-yellow-300 animate-bounce" /> XÁC NHẬN KÍCH HOẠT NGAY! </>
                    ) : (
                        <> {isProcessing ? <Loader2 className="animate-spin" /> : <FileText size={20} />} {isProcessing ? "ĐANG QUÉT GIAO DỊCH..." : "TÔI ĐÃ CHUYỂN KHOẢN XONG"} </>
                    )}
                  </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
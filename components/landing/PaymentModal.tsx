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

  const [currentPlan, setCurrentPlan] = useState(initialPlan || "yearly");
  const [exchangeRate, setExchangeRate] = useState(25500); 
  const [loadingRate, setLoadingRate] = useState(true);
  const [isAgreed, setIsAgreed] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentReady, setIsPaymentReady] = useState(false); 
  const [isUserConfirmed, setIsUserConfirmed] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(false); 
  const [successType, setSuccessType] = useState<'upgrade' | 'renewal'>('upgrade');
  
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const initialExpiryRef = useRef<number>(0);

  const plans = [
    { id: "starter", name: "PRO DAILY", price: 30, icon: <Shield size={16}/>, color: "border-blue-500/50 text-blue-400 bg-blue-500/5" },
    { id: "yearly", name: "VIP YEARLY", price: 299, icon: <Star size={16}/>, color: "border-amber-500/50 text-amber-400 bg-amber-500/5" },
    { id: "LIFETIME", name: "LIFETIME", price: 9999, icon: <Crown size={16}/>, color: "border-purple-500/50 text-purple-400 bg-purple-500/5" }
  ];

  useEffect(() => {
    if (!isOpen || !user || !profile) return;
    if (initialExpiryRef.current === 0) initialExpiryRef.current = profile.expiryDate?.seconds || 0;

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newExpiry = data.expiryDate?.seconds || 0;
        const newPlan = data.plan;

        if (newExpiry > initialExpiryRef.current || newPlan !== profile.plan) {
           setSuccessType(newPlan === profile.plan ? 'renewal' : 'upgrade');
           setIsPaymentReady(true);
        }
      }
    });
    return () => unsub();
  }, [isOpen, user?.uid]);

  useEffect(() => { 
      if (isPaymentReady && isUserConfirmed) {
          setIsProcessing(false);
          setIsSuccess(true); 
      }
  }, [isPaymentReady, isUserConfirmed]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPlan(initialPlan || "yearly");
      setIsAgreed(false); setIsSuccess(false); setIsPaymentReady(false); setIsUserConfirmed(false); setIsProcessing(false);
      initialExpiryRef.current = profile?.expiryDate?.seconds || 0;
      
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
          setTimeout(() => setIsProcessing(false), 30000); 
      }
  };

  if (!isOpen || !profile || !text) return null;

  const selectedData = plans.find(p => p.id === currentPlan) || plans[1];
  const amountVND = Math.ceil((selectedData.price * exchangeRate) / 1000) * 1000;
  const transferContent = `${profile.licenseKey} ${selectedData.id.toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-[#0B1120]/95 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      {isSuccess && <Confetti numberOfPieces={500} gravity={0.3} colors={['#10b981', '#3b82f6', '#f59e0b']} />}
      
      <div className="bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-2xl max-w-lg w-full relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-500 hover:text-white z-10 bg-[#0B1120] p-1.5 rounded-lg border border-slate-800"><X size={20}/></button>
        
        {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    {successType === 'renewal' ? <RefreshCw size={40} className="text-emerald-500" /> : <PartyPopper size={40} className="text-emerald-500" />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    {successType === 'renewal' ? "GIA HẠN THÀNH CÔNG!" : "NÂNG CẤP HOÀN TẤT!"}
                </h2>
                <p className="text-slate-400 text-sm mb-6">Gói <span className="text-emerald-400 font-bold">{selectedData.name}</span> đã kích hoạt.</p>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-emerald-500/30 mb-8 w-full">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle size={16}/> HỆ THỐNG ĐÃ XÁC NHẬN
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-3.5 rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm">
                    <Crown size={18}/> VÀO CHIẾN TRƯỜNG NGAY
                </button>
            </div>
        ) : (
            <>
                <h2 className="text-xl font-bold text-white mb-6 text-center tracking-tight">{text.title}</h2>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {plans.map((p) => (
                    <button key={p.id} onClick={() => setCurrentPlan(p.id)} className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 ${currentPlan === p.id ? p.color : "border-slate-800 bg-[#0B1120] text-slate-500 hover:border-slate-600"}`}>
                      {p.icon} 
                      <span className="text-[10px] font-bold uppercase tracking-wider">{p.name}</span> 
                      <span className="text-sm font-mono font-bold">${p.price}</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-xs text-slate-400 mb-3 font-semibold flex items-center gap-2">
                    {language === 'vi' ? text.bank_transfer : text.crypto_transfer}
                    {language === 'vi' && <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-mono border border-emerald-500/20">1$ ≈ {exchangeRate.toLocaleString()}đ</span>}
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl mb-6 shadow-sm min-h-[180px] flex items-center justify-center">
                    {loadingRate ? <Loader2 className="animate-spin text-slate-400" /> : 
                      <img src={language === 'vi' 
                        ? `https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${BANK_INFO.ACCOUNT_NO}-${BANK_INFO.TEMPLATE}.png?amount=${amountVND}&addInfo=${encodeURIComponent(transferContent)}`
                        : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${MY_USDT_WALLET}`} 
                      alt="QR Code" className="w-40 h-40 object-contain" />
                    }
                  </div>

                  <div className="w-full space-y-3 mb-6">
                    {language === 'vi' ? (
                      <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Chủ tài khoản</p>
                          <p className="text-white font-bold text-sm mb-3">{BANK_INFO.ACCOUNT_NAME}</p>
                          <div className="flex items-center justify-center gap-2 cursor-pointer bg-[#111827] p-2.5 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors group" onClick={() => copyToClipboard(BANK_INFO.ACCOUNT_NO, setCopiedAccount)}>
                              <span className="font-mono font-bold text-lg text-blue-400 tracking-widest">{BANK_INFO.ACCOUNT_NO}</span>
                              {copiedAccount ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} className="text-slate-500 group-hover:text-blue-400"/>}
                          </div>
                      </div>
                    ) : (
                      <div className="bg-[#0B1120] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="overflow-hidden"><p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Ví USDT (TRC20)</p><p className="text-xs font-mono text-emerald-400 truncate">{MY_USDT_WALLET}</p></div>
                        <button onClick={() => copyToClipboard(MY_USDT_WALLET, setCopiedWallet)} className="p-2 text-slate-500 hover:text-white bg-[#111827] rounded-lg border border-slate-700">{copiedWallet ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}</button>
                      </div>
                    )}

                    <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 group cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={() => copyToClipboard(transferContent, setCopiedContent)}>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Nội dung bắt buộc:</p>
                        <div className="flex items-center justify-between bg-[#111827] p-3 rounded-lg border border-slate-700">
                            <code className="text-base font-mono font-bold text-emerald-400 tracking-wider">{transferContent}</code>
                            {copiedContent ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} className="text-slate-500 group-hover:text-emerald-400"/>}
                        </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-8 w-full cursor-pointer group" onClick={() => setIsAgreed(!isAgreed)}>
                    <div className={`mt-0.5 transition-colors ${isAgreed ? "text-emerald-500" : "text-slate-500 group-hover:text-slate-400"}`}>{isAgreed ? <CheckSquare size={18} /> : <Square size={18} />}</div>
                    <div className="text-xs text-slate-400 select-none leading-relaxed group-hover:text-slate-300 transition-colors">{text.agree_text}</div>
                  </div>

                  <button 
                    onClick={handleConfirmPayment} 
                    disabled={(!isAgreed || isProcessing) && !isPaymentReady}
                    className={`w-full py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider
                    ${isPaymentReady 
                        ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-600/20" 
                        : (isAgreed && !isProcessing ? "bg-white text-[#0B1120] hover:bg-slate-200" : "bg-slate-800 text-slate-500 cursor-not-allowed")}`}
                  >
                    {isPaymentReady ? (
                        <> <Zap size={18} /> XÁC NHẬN KÍCH HOẠT </>
                    ) : (
                        <> {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />} {isProcessing ? "ĐANG QUÉT GIAO DỊCH..." : "TÔI ĐÃ CHUYỂN KHOẢN XONG"} </>
                    )}
                  </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
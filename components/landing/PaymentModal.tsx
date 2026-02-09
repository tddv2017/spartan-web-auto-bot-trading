"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, X, Shield, Star, Crown, CheckSquare, Square, FileText, Copy, Check, RefreshCw, CheckCircle, PartyPopper, Zap } from "lucide-react";
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Confetti from 'react-confetti';

// 🔥 CẤU HÌNH VÍ USDT
const MY_USDT_WALLET = "TXWxf32YxYWZ99J7ZrvD3zBF8NPkPobKGG"; 

// 🏦 CẤU HÌNH NGÂN HÀNG
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

  const [currentPlan, setCurrentPlan] = useState(initialPlan || "starter");
  const [exchangeRate, setExchangeRate] = useState(25500); 
  const [loadingRate, setLoadingRate] = useState(true);
  
  const [isAgreed, setIsAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // State kết quả
  const [isPaymentReady, setIsPaymentReady] = useState(false); // 🆕 Tiền về nhưng chưa hiện Success
  const [isUserConfirmed, setIsUserConfirmed] = useState(false); // 🆕 Người dùng đã bấm nút chưa
  const [isSuccess, setIsSuccess] = useState(false); // 🆕 Chỉ True khi cả 2 cái trên đều True
  
  const [successType, setSuccessType] = useState<'upgrade' | 'renewal'>('upgrade');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // 🛡️ BIẾN LƯU TRỮ HẠN DÙNG CŨ
  const initialExpiryRef = useRef<number>(0);

  const plans = [
    { id: "starter", name: "PRO DAILY", price: 30, icon: <Shield size={16}/>, color: "border-blue-500 text-blue-400" },
    { id: "yearly", name: "VIP YEARLY", price: 299, icon: <Star size={16}/>, color: "border-amber-500 text-amber-400" },
    { id: "LIFETIME", name: "LIFETIME", price: 9999, icon: <Crown size={16}/>, color: "border-purple-500 text-purple-400" }
  ];

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // 🔥 1. LOGIC CHECK NGẦM (BACKGROUND CHECK)
  useEffect(() => {
    if (!isOpen || !user || !profile) return;

    if (initialExpiryRef.current === 0 && profile.expiryDate) {
         initialExpiryRef.current = profile.expiryDate.seconds || 0;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const newExpiry = data.expiryDate?.seconds || 0;
            const newPlan = data.plan;

            const isLifetimeUpgrade = newPlan === 'LIFETIME' && profile.plan !== 'LIFETIME';
            const isRenewal = newPlan === profile.plan && newExpiry > initialExpiryRef.current;
            const isUpgrade = newPlan !== 'free' && newPlan !== profile.plan;

            if (isLifetimeUpgrade || isUpgrade) {
                setSuccessType('upgrade');
                setIsPaymentReady(true); // 👉 CHỈ BÁO READY, KHÔNG TỰ SUCCESS
            } else if (isRenewal) {
                setSuccessType('renewal');
                setIsPaymentReady(true); // 👉 CHỈ BÁO READY
            }
        }
    });

    return () => unsub();
  }, [isOpen, user, profile]);

  // 🔥 2. LOGIC KÍCH HOẠT (TRIGGER)
  // Chỉ khi [Tiền Về] + [User Bấm] -> Mới nổ pháo hoa
  useEffect(() => {
      if (isPaymentReady && isUserConfirmed) {
          setIsProcessing(false);
          setIsSuccess(true);
      }
  }, [isPaymentReady, isUserConfirmed]);

  // Reset
  useEffect(() => {
    if (isOpen) {
      setCurrentPlan(initialPlan || "yearly");
      setLoadingRate(true);
      setIsAgreed(false);
      setIsSuccess(false);
      setIsPaymentReady(false); // Reset
      setIsUserConfirmed(false); // Reset
      setIsProcessing(false);
      
      if (profile?.expiryDate) {
          initialExpiryRef.current = profile.expiryDate.seconds || 0;
      } else {
          initialExpiryRef.current = 0;
      }
      
      if (language === 'vi') {
        fetch("https://api.exchangerate-api.com/v4/latest/USD")
          .then(res => res.json())
          .then(data => { if (data.rates?.VND) setExchangeRate(data.rates.VND); })
          .catch(console.error)
          .finally(() => setLoadingRate(false));
      } else {
        setLoadingRate(false);
      }
    }
  }, [isOpen, initialPlan, language, profile]);

  if (!isOpen || !profile || !text) return null;

  const selectedData = plans.find(p => p.id === currentPlan) || plans[1];
  const amountVND = Math.ceil((selectedData.price * exchangeRate) / 1000) * 1000;
  const transferContent = `${profile.licenseKey} ${selectedData.id.toUpperCase()}`;
  const qrUrlVN = `https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${BANK_INFO.ACCOUNT_NO}-${BANK_INFO.TEMPLATE}.png?amount=${amountVND}&addInfo=${encodeURIComponent(transferContent)}`;
  const qrUrlCrypto = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${MY_USDT_WALLET}`;

  const copyToClipboard = (txt: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(txt);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleConfirmPayment = () => {
      // 1. Đánh dấu là user đã bấm
      setIsUserConfirmed(true);

      // 2. Nếu tiền chưa về -> Hiện loading quay quay
      if (!isPaymentReady) {
          setIsProcessing(true);
          // Fallback: Nếu đợi lâu quá (ví dụ 10s) mà chưa thấy gì thì hiện thông báo
          // (Nhưng ở đây ta để quay cho đến khi tiền về hoặc user tắt đi)
      }
      // 3. Nếu tiền đã về (isPaymentReady = true) -> useEffect ở trên sẽ tự bắt và chuyển sang Success ngay lập tức.
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* 🎉 PHÁO HOA TUNG TRỜI (CHỈ NỔ KHI CÓ SUCCESS) */}
      {isSuccess && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={800} gravity={0.2} />}

      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white z-10"><X size={24}/></button>
        
        {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-500 relative z-20">
                <div className="w-28 h-28 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                    {successType === 'renewal' ? <RefreshCw size={60} className="text-green-400 animate-spin-slow" /> : <PartyPopper size={60} className="text-yellow-400 animate-pulse" />}
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400 mb-2 uppercase tracking-tighter">
                    {successType === 'renewal' ? "GIA HẠN THÀNH CÔNG!" : "NÂNG CẤP HOÀN TẤT!"}
                </h2>
                
                <p className="text-white font-bold text-lg mb-2">Gói <span className="text-yellow-400">{selectedData.name}</span> đã được kích hoạt.</p>
                
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-8 max-w-xs mx-auto">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-1">Trạng thái tài khoản</p>
                    <div className="flex items-center justify-center gap-2 text-green-400 font-mono font-bold">
                        <CheckCircle size={16}/> ACTIVE (ĐÃ CỘNG NGÀY)
                    </div>
                </div>

                <button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-green-900/40 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-sm flex items-center gap-2">
                    <Crown size={18}/> VÀO CHIẾN TRƯỜNG NGAY
                </button>
            </div>
        ) : (
            // ... Màn hình thanh toán ...
            <>
                <h2 className="text-2xl font-black text-white mb-6 text-center uppercase tracking-tighter italic">{text.title}</h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {plans.map((p) => (
                    <button key={p.id} onClick={() => setCurrentPlan(p.id)} className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${currentPlan === p.id ? `${p.color} bg-slate-800` : "border-slate-800 text-slate-500 opacity-50"}`}>
                      {p.icon} <span className="text-[10px] font-black uppercase">{p.name}</span> <span className="text-xs font-mono">${p.price}</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-widest flex items-center gap-2">
                    {language === 'vi' ? text.bank_transfer : text.crypto_transfer}
                    {language === 'vi' && <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-green-400 font-mono">1$ ≈ {exchangeRate.toLocaleString()}đ</span>}
                  </div>
                  <div className="bg-white p-4 rounded-3xl mb-6 shadow-lg relative group min-h-[200px] flex items-center justify-center">
                    {language === 'vi' && loadingRate ? <div className="flex flex-col items-center text-slate-500 text-xs"><RefreshCw className="animate-spin mb-2 text-green-500" /> Đang cập nhật tỷ giá...</div> : <img src={language === 'vi' ? qrUrlVN : qrUrlCrypto} alt="QR" className="w-48 h-48 object-contain" />}
                  </div>

                  {language === 'vi' ? (
                      <div className="w-full space-y-3 mb-6">
                        <div className="text-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                            <p className="text-[10px] text-slate-500 uppercase">Chủ tài khoản</p>
                            <p className="text-xl font-black text-blue-400 uppercase tracking-wide mb-1">{BANK_INFO.ACCOUNT_NAME}</p>
                            <div className="flex items-center justify-center gap-2 cursor-pointer hover:text-white text-slate-300" onClick={() => copyToClipboard(BANK_INFO.ACCOUNT_NO, setCopiedAccount)}>
                                <span className="font-mono font-bold text-lg">{BANK_INFO.ACCOUNT_NO}</span>
                                <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{BANK_INFO.BANK_ID}</span>
                                {copiedAccount ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
                            </div>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-700">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Nội dung chuyển khoản (Bắt buộc):</p>
                            <div className="flex items-center justify-between gap-2 group cursor-pointer" onClick={() => copyToClipboard(transferContent, setCopiedContent)}>
                                <code className="text-lg font-mono font-black text-green-400 tracking-wider break-all">{transferContent}</code>
                                <button className="text-slate-400 hover:text-white">{copiedContent ? <Check size={18} className="text-green-500"/> : <Copy size={18}/>}</button>
                            </div>
                        </div>
                      </div>
                  ) : (
                    <div className="w-full bg-slate-800/50 p-3 rounded-xl border border-slate-700 mb-4 flex items-center justify-between gap-2">
                      <div className="overflow-hidden"><p className="text-[10px] text-slate-500 uppercase font-bold">{text.wallet_label}</p><p className="text-xs font-mono text-green-400 truncate">{MY_USDT_WALLET}</p></div>
                      <button onClick={() => copyToClipboard(MY_USDT_WALLET, setCopiedWallet)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white">{copiedWallet ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}</button>
                    </div>
                  )}

                  <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase font-bold tracking-widest">{text.total}</span>
                      <span className="text-green-500 font-black text-lg">{language === 'vi' ? loadingRate ? "..." : `${amountVND.toLocaleString('vi-VN')} VNĐ` : `$${selectedData.price} USDT`}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-6 w-full p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:bg-slate-800/50" onClick={() => setIsAgreed(!isAgreed)}>
                    <div className={`mt-0.5 ${isAgreed ? "text-green-500" : "text-slate-600"}`}>{isAgreed ? <CheckSquare size={20} /> : <Square size={20} />}</div>
                    <div className="text-xs text-slate-400 select-none leading-relaxed">{text.agree_text}</div>
                  </div>

                  {/* 🔽 NÚT BẤM THÔNG MINH - CHỐT CHẶN CUỐI CÙNG 🔽 */}
                  <button 
                    onClick={handleConfirmPayment} 
                    disabled={(!isAgreed || isProcessing) && !isPaymentReady} // Chỉ disable nếu tiền chưa về
                    className={`w-full py-4 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 
                    ${isPaymentReady 
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 animate-pulse text-white cursor-pointer border-2 border-white/20" // Nếu tiền về -> Nút sáng rực
                        : (isAgreed && !isProcessing 
                            ? "bg-slate-700 hover:bg-slate-600 text-white" 
                            : "bg-slate-800 text-slate-500 cursor-not-allowed")}`}
                  >
                    {isPaymentReady ? (
                        <>
                            <Zap size={24} className="fill-yellow-300 text-yellow-300 animate-bounce" /> 
                            TIỀN ĐÃ VỀ - BẤM ĐỂ KÍCH HOẠT!
                        </>
                    ) : (
                        <>
                            {isProcessing ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
                            {isProcessing ? "ĐANG TÌM GIAO DỊCH..." : "TÔI ĐÃ CHUYỂN KHOẢN XONG"}
                        </>
                    )}
                  </button>

                </div>
            </>
        )}
      </div>
    </div>
  );
}
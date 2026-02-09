"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { Loader2, X, Shield, Star, Crown, CheckSquare, Square, FileText, Copy, Check, RefreshCw, CheckCircle } from "lucide-react";
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

  const [isSuccess, setIsSuccess] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // 🛡️ BIẾN LƯU TRỮ HẠN DÙNG CŨ (Dùng useRef để không bị reset khi render lại)
  const initialExpiryRef = useRef<number>(0);

  const plans = [
    { id: "starter", name: "PRO DAILY", price: 30, icon: <Shield size={16}/>, color: "border-blue-500 text-blue-400" },
    { id: "yearly", name: "VIP YEARLY", price: 299, icon: <Star size={16}/>, color: "border-amber-500 text-amber-400" },
    { id: "LIFETIME", name: "LIFETIME", price: 9999, icon: <Crown size={16}/>, color: "border-purple-500 text-purple-400" }
  ];

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // 🔥 LOGIC MỚI: CHECK KỸ CÀNG HƠN
  useEffect(() => {
    if (!isOpen || !user || !profile) return;

    // 1. Lưu lại hạn dùng lúc mới mở Modal
    if (initialExpiryRef.current === 0 && profile.expiryDate) {
         // Firestore Timestamp -> seconds
         initialExpiryRef.current = profile.expiryDate.seconds || 0;
    }

    // 2. Lắng nghe thay đổi
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const newExpiry = data.expiryDate?.seconds || 0;
            const newPlan = data.plan;

            // 🎯 ĐIỀU KIỆN THÀNH CÔNG (SỬA LẠI):
            // 1. Nếu mua LIFETIME: Chỉ cần plan đổi thành LIFETIME là xong.
            // 2. Nếu gia hạn (Plan cũ == Plan mới): Hạn dùng (newExpiry) PHẢI LỚN HƠN hạn cũ (initialExpiryRef).
            // 3. Nếu nâng cấp (Plan cũ != Plan mới): Chỉ cần Plan thay đổi.

            const isUpgrade = newPlan !== 'free' && newPlan !== profile.plan; // Nâng cấp gói
            const isRenewal = newPlan === profile.plan && newExpiry > initialExpiryRef.current; // Gia hạn (Quan trọng!)
            const isLifetime = newPlan === 'LIFETIME' && profile.plan !== 'LIFETIME';

            if (isUpgrade || isRenewal || isLifetime) {
                setIsSuccess(true);
            }
        }
    });

    return () => unsub();
  }, [isOpen, user, profile]); // Bỏ currentPlan ra khỏi dependency để tránh loop

  // Reset khi đóng mở
  useEffect(() => {
    if (isOpen) {
      setCurrentPlan(initialPlan || "yearly");
      setLoadingRate(true);
      setIsAgreed(false);
      setIsSuccess(false);
      
      // Reset mốc so sánh
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
  }, [isOpen, initialPlan, language, profile]); // Thêm profile vào để cập nhật ref

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
      setIsProcessing(true);
      setTimeout(() => {
          alert("⏳ Hệ thống đang chờ tiền về... (Vui lòng đợi 30s - 1 phút)");
          setIsProcessing(false);
      }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl animate-in fade-in duration-300">
      {isSuccess && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500}/>}

      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white z-10"><X size={24}/></button>
        
        {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle size={60} className="text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">GIA HẠN THÀNH CÔNG!</h2>
                <p className="text-green-400 font-bold text-lg mb-4">Gói {selectedData.name} đã được cộng thêm ngày.</p>
                <p className="text-slate-400 text-sm mb-8 px-4">
                    Cảm ơn Đại tá đã tiếp tục đồng hành. Hệ thống đã cập nhật hạn sử dụng mới.
                </p>
                <button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wide">
                    QUAY LẠI CHIẾN TRƯỜNG
                </button>
            </div>
        ) : (
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

                  <button onClick={handleConfirmPayment} disabled={!isAgreed || isProcessing} className={`w-full py-4 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isAgreed && !isProcessing ? "bg-green-500 hover:bg-green-400 text-black cursor-pointer hover:scale-105 active:scale-95" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
                    {isProcessing ? "ĐANG QUÉT GIAO DỊCH..." : "TÔI ĐÃ CHUYỂN KHOẢN XONG"}
                  </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
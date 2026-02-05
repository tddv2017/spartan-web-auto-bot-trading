"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext"; // 👈 Import Language
import { Loader2, X, Shield, Star, Crown, CheckSquare, Square, FileText, Copy, Check } from "lucide-react";
import Link from "next/link";

// 🔥 CẤU HÌNH VÍ USDT CỦA ĐẠI TÁ TẠI ĐÂY
const MY_USDT_WALLET = "TXWxf32YxYWZ99J7ZrvD3zBF8NPkPobKGG"; // Thay bằng ví thật của Đại tá (TRC20)

export default function PaymentModal({ isOpen, onClose, plan: initialPlan }: { isOpen: boolean; onClose: () => void; plan: string }) {
  const { profile } = useAuth();
  const { t, language } = useLanguage(); // 👈 Lấy ngôn ngữ hiện tại
  const text = t.payment; // Rút gọn

  const [currentPlan, setCurrentPlan] = useState(initialPlan || "starter");
  const [exchangeRate, setExchangeRate] = useState(25500);
  const [loadingRate, setLoadingRate] = useState(true);
  
  const [isAgreed, setIsAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Danh mục trang bị
  const plans = [
    { id: "starter", name: "PRO DAILY", price: 30, icon: <Shield size={16}/>, color: "border-blue-500 text-blue-400" },
    { id: "yearly", name: "VIP YEARLY", price: 299, icon: <Star size={16}/>, color: "border-amber-500 text-amber-400" },
    { id: "lifetime", name: "LIFETIME", price: 9999, icon: <Crown size={16}/>, color: "border-purple-500 text-purple-400" }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentPlan(initialPlan);
      setLoadingRate(true);
      setIsAgreed(false);
      
      // Chỉ fetch tỷ giá nếu là khách Việt (để đổi ra VND)
      if (language === 'vi') {
        fetch("https://api.exchangerate-api.com/v4/latest/USD")
          .then(res => res.json())
          .then(data => {
            if (data.rates.VND) setExchangeRate(data.rates.VND);
            setLoadingRate(false);
          }).catch(() => setLoadingRate(false));
      } else {
        setLoadingRate(false);
      }
    }
  }, [isOpen, initialPlan, language]);

  if (!isOpen || !profile || !text) return null;

  const selectedData = plans.find(p => p.id === currentPlan) || plans[0];
  const amountVND = Math.ceil((selectedData.price * exchangeRate) / 1000) * 1000;
  
  // URL VietQR (Chỉ dùng cho VN)
  const qrUrlVN = `https://img.vietqr.io/image/ACB-189362839-compact2.png?amount=${amountVND}&addInfo=${encodeURIComponent(`GIA HAN ${profile.licenseKey}`)}&accountName=${encodeURIComponent("LE QUOC DUNG")}`;
  
  // URL QR Crypto (Dùng cho Quốc tế) - Tạo mã QR chứa địa chỉ ví
  const qrUrlCrypto = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${MY_USDT_WALLET}`;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(MY_USDT_WALLET);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  }

  const handleConfirmPayment = async () => {
    if (!isAgreed) return;
    setIsProcessing(true);

    const agreementRecord = {
      timestamp: new Date().toISOString(),
      userId: profile.id,
      email: profile.email,
      licenseKey: profile.licenseKey,
      plan: selectedData.name,
      amount: language === 'vi' ? amountVND : selectedData.price,
      currency: language === 'vi' ? 'VND' : 'USD',
      method: language === 'vi' ? 'VietQR' : 'USDT', // Ghi nhận phương thức
      agreedToTerms: true,
      signature: `SIGNED_BY_${profile.licenseKey}_AT_${Date.now()}`
    };

    try {
      console.log("📝 [SYSTEM] Order Created:", agreementRecord);
      
      setTimeout(() => {
        alert(text.success);
        setIsProcessing(false);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Error", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24}/></button>
        
        <h2 className="text-2xl font-black text-white mb-6 text-center uppercase tracking-tighter italic">
          {text.title}
        </h2>

        {/* 📋 BỘ CHỌN GÓI */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setCurrentPlan(p.id)}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                currentPlan === p.id ? `${p.color} bg-slate-800` : "border-slate-800 text-slate-500 opacity-50"
              }`}
            >
              {p.icon}
              <span className="text-[10px] font-black uppercase">{p.name}</span>
              <span className="text-xs font-mono">${p.price}</span>
            </button>
          ))}
        </div>

        {/* 🖼️ KHU VỰC QR CODE (TÙY BIẾN THEO NGÔN NGỮ) */}
        <div className="flex flex-col items-center">
          
          <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-widest">
            {language === 'vi' ? text.bank_transfer : text.crypto_transfer}
          </div>

          <div className="bg-white p-4 rounded-3xl mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)] relative group">
            {language === 'vi' && loadingRate ? (
              <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-500 italic text-xs">
                <Loader2 className="animate-spin mb-2 text-black" /> {text.loading}
              </div>
            ) : (
              <img 
                src={language === 'vi' ? qrUrlVN : qrUrlCrypto} 
                alt="QR Payment" 
                className="w-48 h-48 object-contain" 
              />
            )}
          </div>

          {/* Nếu là Quốc tế -> Hiện thêm địa chỉ ví để copy */}
          {language === 'en' && (
            <div className="w-full bg-slate-800/50 p-3 rounded-xl border border-slate-700 mb-4 flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-500 uppercase font-bold">{text.wallet_label}</p>
                <p className="text-xs font-mono text-green-400 truncate">{MY_USDT_WALLET}</p>
              </div>
              <button 
                onClick={handleCopyWallet}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                title="Copy Address"
              >
                {copiedWallet ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
              </button>
            </div>
          )}

          {/* Tổng tiền */}
          <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 mb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 uppercase font-bold tracking-widest">{text.total}</span>
              <span className="text-green-500 font-black text-lg">
                {language === 'vi' 
                  ? `${amountVND.toLocaleString('vi-VN')} VNĐ` 
                  : `$${selectedData.price} USDT`
                }
              </span>
            </div>
          </div>

          {/* 🔥 CHECKBOX CAM KẾT */}
          <div 
            className="flex items-start gap-3 mb-6 w-full p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsAgreed(!isAgreed)}
          >
            <div className={`mt-0.5 ${isAgreed ? "text-green-500" : "text-slate-600"}`}>
              {isAgreed ? <CheckSquare size={20} /> : <Square size={20} />}
            </div>
            <div className="text-xs text-slate-400 select-none leading-relaxed">
              {text.agree_text}
            </div>
          </div>

          <button 
            onClick={handleConfirmPayment} 
            disabled={!isAgreed || isProcessing}
            className={`w-full py-4 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              isAgreed && !isProcessing
                ? "bg-green-500 hover:bg-green-400 text-black cursor-pointer hover:scale-105 active:scale-95" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
            {isProcessing ? text.btn_processing : text.btn_confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
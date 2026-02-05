"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { Loader2, X, Shield, Star, Crown, CheckSquare, Square, FileText, Copy, Check, RefreshCw } from "lucide-react";

// 🔥 CẤU HÌNH VÍ USDT (Đại tá thay ví thật vào đây)
const MY_USDT_WALLET = "TXWxf32YxYWZ99J7ZrvD3zBF8NPkPobKGG"; 

// 🏦 CẤU HÌNH NGÂN HÀNG (Để tạo mã VietQR)
const BANK_INFO = {
  BANK_ID: "ACB",        // Mã ngân hàng (MB, VCB, TCB, ACB...)
  ACCOUNT_NO: "189362839", // Số tài khoản của Đại tá
  TEMPLATE: "PRINT",  // Mẫu QR
  ACCOUNT_NAME: "LE QUOC DUNG" // Tên chủ tài khoản
};

export default function PaymentModal({ isOpen, onClose, plan: initialPlan }: { isOpen: boolean; onClose: () => void; plan: string }) {
  const { profile } = useAuth();
  const { t, language } = useLanguage(); 
  const text = t.payment; 

  const [currentPlan, setCurrentPlan] = useState(initialPlan || "starter");
  // Mặc định 25.500 phòng trường hợp API lỗi
  const [exchangeRate, setExchangeRate] = useState(25500); 
  const [loadingRate, setLoadingRate] = useState(true);
  
  const [isAgreed, setIsAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Danh mục trang bị
  const plans = [
    { id: "starter", name: "PRO DAILY", price: 30, icon: <Shield size={16}/>, color: "border-blue-500 text-blue-400" },
    { id: "yearly", name: "VIP YEARLY", price: 299, icon: <Star size={16}/>, color: "border-amber-500 text-amber-400" },
    { id: "lifetime", name: "LIFETIME", price: 9999, icon: <Crown size={16}/>, color: "border-purple-500 text-purple-400" }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentPlan(initialPlan || "yearly");
      setLoadingRate(true);
      setIsAgreed(false);
      
      // Chỉ fetch tỷ giá nếu là khách Việt (để đổi ra VND)
      if (language === 'vi') {
        fetch("https://api.exchangerate-api.com/v4/latest/USD")
          .then(res => res.json())
          .then(data => {
            if (data.rates && data.rates.VND) {
                setExchangeRate(data.rates.VND);
            }
          })
          .catch((err) => console.error("Lỗi lấy tỷ giá:", err))
          .finally(() => setLoadingRate(false));
      } else {
        setLoadingRate(false);
      }
    }
  }, [isOpen, initialPlan, language]);

  if (!isOpen || !profile || !text) return null;

  const selectedData = plans.find(p => p.id === currentPlan) || plans[1];
  
  // 1. TÍNH TIỀN VND (Làm tròn đến hàng nghìn)
  const amountVND = Math.ceil((selectedData.price * exchangeRate) / 1000) * 1000;
  
  // 2. TẠO NỘI DUNG CHUYỂN KHOẢN CHUẨN (QUAN TRỌNG ĐỂ AUTO)
  // Cú pháp: [LICENSE_KEY] [ID_GOI] -> VD: SPARTAN-XH821 YEARLY
  const transferContent = `${profile.licenseKey} ${selectedData.id.toUpperCase()}`;

  // 3. TẠO URL VIETQR
  const qrUrlVN = `https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${BANK_INFO.ACCOUNT_NO}-${BANK_INFO.TEMPLATE}.png?amount=${amountVND}&addInfo=${encodeURIComponent(transferContent)}`;
  
  // 4. TẠO URL CRYPTO
  const qrUrlCrypto = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${MY_USDT_WALLET}`;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(MY_USDT_WALLET);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  }

  const handleCopyContent = () => {
    navigator.clipboard.writeText(transferContent);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  }

  const handleConfirmPayment = async () => {
    if (!isAgreed) return;
    setIsProcessing(true);

    // Giả lập gửi đơn (Thực tế Webhook sẽ xử lý khi tiền về)
    setTimeout(() => {
      alert(language === 'vi' 
        ? "✅ Đã nhận yêu cầu! Hệ thống sẽ tự động kích hoạt ngay khi tiền về tài khoản (1-3 phút)."
        : "✅ Request received! The system will automatically activate your plan once the payment is confirmed (1-3 mins).");
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_INFO.ACCOUNT_NO);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  }

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

        {/* 🖼️ KHU VỰC QR CODE */}
        <div className="flex flex-col items-center">
          
          <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-widest flex items-center gap-2">
            {language === 'vi' ? text.bank_transfer : text.crypto_transfer}
            {language === 'vi' && (
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-green-400 font-mono">
                    1$ ≈ {exchangeRate.toLocaleString()}đ
                </span>
            )}
          </div>

          <div className="bg-white p-4 rounded-3xl mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)] relative group min-h-[200px] flex items-center justify-center">
            {language === 'vi' && loadingRate ? (
              <div className="flex flex-col items-center justify-center text-slate-500 italic text-xs animate-pulse">
                <RefreshCw className="animate-spin mb-2 text-green-500" /> Đang cập nhật tỷ giá...
              </div>
            ) : (
              <img 
                src={language === 'vi' ? qrUrlVN : qrUrlCrypto} 
                alt="QR Payment" 
                className="w-48 h-48 object-contain" 
              />
            )}
          </div>

          {/* 🔥 QUAN TRỌNG: HIỂN THỊ NỘI DUNG CHUYỂN KHOẢN CHO KHÁCH VIỆT */}
          {language === 'vi' ? (
             <div className="w-full space-y-3 mb-6">
              {/* STK & TÊN CHỦ TK TO RÕ */}
                <div className="text-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase">Chủ tài khoản</p>
                    <p className="text-xl font-black text-blue-400 uppercase tracking-wide mb-1">{BANK_INFO.ACCOUNT_NAME}</p>
                    
                    <div className="flex items-center justify-center gap-2 cursor-pointer hover:text-white text-slate-300" onClick={handleCopyAccount}>
                        <span className="font-mono font-bold text-lg">{BANK_INFO.ACCOUNT_NO}</span>
                        <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{BANK_INFO.BANK_ID}</span>
                        {copiedAccount ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
                    </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Nội dung chuyển khoản (Bắt buộc):</p>
                    <div className="flex items-center justify-between gap-2 group cursor-pointer" onClick={handleCopyContent}>
                        <code className="text-lg font-mono font-black text-green-400 tracking-wider break-all">
                            {transferContent}
                        </code>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            {copiedContent ? <Check size={18} className="text-green-500"/> : <Copy size={18}/>}
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-yellow-500 text-center italic">*Hệ thống tự động kích hoạt khi nhận đúng nội dung này.</p>
             </div>
          ) : (
            // Khách quốc tế: Hiện ví USDT
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
                  ? loadingRate ? "..." : `${amountVND.toLocaleString('vi-VN')} VNĐ` 
                  : `$${selectedData.price} USDT`
                }
              </span>
            </div>
          </div>

          {/* CHECKBOX CAM KẾT */}
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

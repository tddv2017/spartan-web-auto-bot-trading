"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2, DollarSign, X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
}

export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const { profile } = useAuth();
  const [exchangeRate, setExchangeRate] = useState(25500);
  const [loadingRate, setLoadingRate] = useState(true);

  // 💰 Cấu hình giá USD theo gói
  const getPriceUSD = () => {
    switch (plan) {
      case "starter": return 30;
      case "lifetime": return 699;
      case "yearly": return 299;
      default: return 299;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoadingRate(true);
      fetch("https://api.exchangerate-api.com/v4/latest/USD")
        .then((res) => res.json())
        .then((data) => {
          if (data.rates.VND) setExchangeRate(data.rates.VND);
          setLoadingRate(false);
        })
        .catch(() => setLoadingRate(false));
    }
  }, [isOpen]);

  if (!isOpen || !profile) return null;

  const PRICE_USD = getPriceUSD();
  const amountVND = Math.ceil((PRICE_USD * exchangeRate) / 1000) * 1000;
  
  // 🏦 THÔNG TIN VIETINBANK CỦA ĐẠI TÁ
  const BANK_ID = "ICB"; 
  const ACCOUNT_NO = "0931497764"; 
  const ACCOUNT_NAME = "LE QUOC DUNG";
  const description = `GIA HAN ${profile.licenseKey}`;

  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amountVND}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-green-500/30 p-8 rounded-3xl max-w-md w-full text-center relative shadow-[0_0_50px_rgba(34,197,94,0.2)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X size={24} />
        </button>

        <div className="flex justify-center mb-4">
          <div className="bg-green-500/20 p-3 rounded-full">
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-white mb-1 uppercase">Tiếp Tế Quân Lương</h2>
        <p className="text-slate-400 text-sm mb-6 italic">Gói {plan.toUpperCase()}: ${PRICE_USD}</p>
        
        {loadingRate ? (
          <div className="flex flex-col items-center justify-center h-64 mb-6">
            <Loader2 className="animate-spin text-green-500 mb-2" size={40} />
            <p className="text-xs text-slate-500">Đang cập nhật tỷ giá...</p>
          </div>
        ) : (
          <div className="bg-white p-3 rounded-2xl mb-6 inline-block shadow-lg ring-4 ring-green-500/20">
            <img src={qrUrl} alt="VietQR" className="w-64 h-64" />
          </div>
        )}

        <div className="text-left bg-slate-800/50 border border-slate-700 p-4 rounded-xl mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Số tiền:</span>
            <span className="text-white font-black">{amountVND.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Nội dung:</span>
            <span className="text-green-500 font-mono font-black uppercase text-xs">{description}</span>
          </div>
        </div>

        <button onClick={onClose} className="w-full py-4 bg-green-500 hover:bg-green-600 text-black font-black rounded-xl transition-all shadow-lg shadow-green-500/20">
          XÁC NHẬN ĐÃ CHUYỂN KHOẢN
        </button>
      </div>
    </div>
  );
}
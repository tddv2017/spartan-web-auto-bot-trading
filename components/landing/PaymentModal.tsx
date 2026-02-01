"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2, DollarSign, X, Shield, Star, Crown, Check } from "lucide-react";

export default function PaymentModal({ isOpen, onClose, plan: initialPlan }: { isOpen: boolean; onClose: () => void; plan: string }) {
  const { profile } = useAuth();
  const [currentPlan, setCurrentPlan] = useState(initialPlan || "starter");
  const [exchangeRate, setExchangeRate] = useState(25500);
  const [loadingRate, setLoadingRate] = useState(true);

  // Danh mục trang bị
  const plans = [
    { id: "starter", name: "PRO DAILY", price: 30, icon: <Shield size={16}/>, color: "border-blue-500 text-blue-400" },
    { id: "yearly", name: "VIP YEARLY", price: 299, icon: <Star size={16}/>, color: "border-amber-500 text-amber-400" },
    { id: "lifetime", name: "LIFETIME", price: 9999, icon: <Crown size={16}/>, color: "border-purple-500 text-purple-400" }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentPlan(initialPlan); // Cập nhật lại gói nếu khách chọn từ ngoài Landing
      setLoadingRate(true);
      fetch("https://api.exchangerate-api.com/v4/latest/USD")
        .then(res => res.json())
        .then(data => {
          if (data.rates.VND) setExchangeRate(data.rates.VND);
          setLoadingRate(false);
        }).catch(() => setLoadingRate(false));
    }
  }, [isOpen, initialPlan]);

  if (!isOpen || !profile) return null;

  const selectedData = plans.find(p => p.id === currentPlan) || plans[0];
  const amountVND = Math.ceil((selectedData.price * exchangeRate) / 1000) * 1000;
  
  const qrUrl = `https://img.vietqr.io/image/ICB-0931497764-compact2.png?amount=${amountVND}&addInfo=${encodeURIComponent(`GIA HAN ${profile.licenseKey}`)}&accountName=${encodeURIComponent("LE QUOC DUNG")}`;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24}/></button>
        
        <h2 className="text-2xl font-black text-white mb-6 text-center uppercase tracking-tighter italic">Lựa Chọn Quân Hàm</h2>

        {/* 📋 BỘ CHỌN GÓI NGAY TRONG MODAL */}
        <div className="grid grid-cols-3 gap-3 mb-8">
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

        {/* 🖼️ MÃ QR TỰ ĐỘNG NHẢY THEO GÓI ĐÃ CHỌN */}
        <div className="flex flex-col items-center">
          {loadingRate ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 italic text-xs">
              <Loader2 className="animate-spin mb-2" /> Đang tính toán tỷ giá...
            </div>
          ) : (
            <div className="bg-white p-4 rounded-3xl mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <img src={qrUrl} alt="QR" className="w-70 h-70" />
            </div>
          )}

          <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 uppercase font-bold tracking-widest">Tổng tiền quân lương:</span>
              <span className="text-green-500 font-black text-lg">{amountVND.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl transition-all shadow-lg">
            XÁC NHẬN ĐÃ TIẾP TẾ
          </button>
        </div>
      </div>
    </div>
  );
}
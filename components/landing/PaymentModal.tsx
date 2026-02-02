"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2, X, Shield, Star, Crown, CheckSquare, Square, FileText } from "lucide-react";
import Link from "next/link";

export default function PaymentModal({ isOpen, onClose, plan: initialPlan }: { isOpen: boolean; onClose: () => void; plan: string }) {
  const { profile } = useAuth();
  const [currentPlan, setCurrentPlan] = useState(initialPlan || "starter");
  const [exchangeRate, setExchangeRate] = useState(25500);
  const [loadingRate, setLoadingRate] = useState(true);
  
  // 🔥 STATE MỚI: Check đồng ý điều khoản
  const [isAgreed, setIsAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
      setIsAgreed(false); // Reset checkbox khi mở lại
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

  // 🔥 HÀM XỬ LÝ: Tạo "File" dữ liệu gửi về Admin
  const handleConfirmPayment = async () => {
    if (!isAgreed) return;
    setIsProcessing(true);

    // 1. Tạo đối tượng dữ liệu (Giả lập file Hợp đồng điện tử)
    const agreementRecord = {
      timestamp: new Date().toISOString(),
      userId: profile.id, // ID người dùng
      email: profile.email,
      licenseKey: profile.licenseKey,
      plan: selectedData.name,
      amount: amountVND,
      agreedToTerms: true,
      signature: `SIGNED_BY_${profile.licenseKey}_AT_${Date.now()}` // Chữ ký số giả lập
    };

    try {
      // 2. Gửi dữ liệu này về API của Đại tá để lưu vào Database
      // await fetch('/api/admin/save-agreement', { method: 'POST', body: JSON.stringify(agreementRecord) });
      
      console.log("📝 [SYSTEM] Đã tạo file xác nhận:", agreementRecord);
      
      // Giả lập độ trễ mạng
      setTimeout(() => {
        alert("✅ Đã ghi nhận cam kết! Vui lòng chờ Admin duyệt lệnh nạp.");
        setIsProcessing(false);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Lỗi lưu file", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl">
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24}/></button>
        
        <h2 className="text-2xl font-black text-white mb-6 text-center uppercase tracking-tighter italic">Lựa Chọn Quân Hàm</h2>

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

        {/* 🖼️ MÃ QR */}
        <div className="flex flex-col items-center">
          {loadingRate ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 italic text-xs">
              <Loader2 className="animate-spin mb-2" /> Đang tính toán tỷ giá...
            </div>
          ) : (
            <div className="bg-white p-4 rounded-3xl mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <img src={qrUrl} alt="QR" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
            </div>
          )}

          <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 mb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 uppercase font-bold tracking-widest">Tổng tiền quân lương:</span>
              <span className="text-green-500 font-black text-lg">{amountVND.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>

          {/* 🔥 PHẦN CAM KẾT ĐIỀU KHOẢN (MỚI) */}
          <div 
            className="flex items-start gap-3 mb-6 w-full p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsAgreed(!isAgreed)}
          >
            <div className={`mt-0.5 ${isAgreed ? "text-green-500" : "text-slate-600"}`}>
              {isAgreed ? <CheckSquare size={20} /> : <Square size={20} />}
            </div>
            <div className="text-xs text-slate-400 select-none">
              Tôi đồng ý với <Link href="/terms" target="_blank" className="text-blue-400 hover:underline font-bold" onClick={(e) => e.stopPropagation()}>Điều khoản & Chính sách rủi ro</Link>. 
              <br/> Tôi hiểu rằng thị trường có rủi ro và không yêu cầu hoàn tiền sau khi nhận Key.
            </div>
          </div>

          <button 
            onClick={handleConfirmPayment} 
            disabled={!isAgreed || isProcessing}
            className={`w-full py-4 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              isAgreed && !isProcessing
                ? "bg-green-500 hover:bg-green-400 text-black cursor-pointer" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
            {isProcessing ? "ĐANG LƯU HỒ SƠ..." : "XÁC NHẬN & TẠO LỆNH"}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Zap, ZapOff, ShieldAlert, Activity, Lock, Radio, Loader2 } from 'lucide-react';

export const BotControlPanel = ({ userData }: { userData: any }) => {
  const [loading, setLoading] = useState(false);
  
  // 1. Lấy trạng thái thực từ Firestore (Real-time)
  const isPaused = userData?.remoteCommand === "PAUSE";
  
  // 2. Lấy thông điệp tình báo từ Admin
  const intelMessage = userData?.intelMessage || "MARKET STABLE";
  
  // 3. Kiểm tra xem có bị Admin khóa cứng không
  const isLockedByAdmin = userData?.licenseKey === "STOP";

  // Hàm xử lý khi KHÁCH tự bấm nút
  const handleToggle = async () => {
    if (isLockedByAdmin) {
      alert("⛔ HỆ THỐNG ĐANG BỊ KHÓA BỞI ADMIN! Vui lòng liên hệ hỗ trợ.");
      return;
    }

    const newStatus = isPaused ? "RUN" : "PAUSE";
    
    // Nếu khách tự Resume khi đang có tin bão, hỏi kỹ lại
    if (isPaused && intelMessage.includes("HIGH IMPACT")) {
        if(!confirm("⚠️ CẢNH BÁO: Admin đang báo có tin tức mạnh.\nBạn có chắc chắn muốn BẬT lại Bot lúc này không?")) return;
    } else {
        if (!confirm(isPaused ? "Kích hoạt lại hệ thống?" : "⚠️ TẠM DỪNG BOT? (Lệnh cũ sẽ chuyển sang chế độ phòng thủ)")) return;
    }

    setLoading(true);
    try {
      const docId = userData.id || userData.uid;
      await updateDoc(doc(db, "users", docId), {
        remoteCommand: newStatus,
        intelMessage: newStatus === "PAUSE" ? "PAUSED BY USER" : "MARKET STABLE"
      });
    } catch (e) { alert("Lỗi kết nối!"); }
    setLoading(false);
  };

  // --- GIAO DIỆN KHÓA (SYSTEM LOCKED) ---
  if (isLockedByAdmin) {
    return (
      <div className="bg-[#111827] border border-red-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <Lock size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold tracking-tight text-red-500 uppercase">SYSTEM LOCKED</h4>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">Contact Admin for support</p>
          </div>
        </div>
        <button disabled className="w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700">
          DISABLED
        </button>
      </div>
    );
  }

  // --- GIAO DIỆN ĐIỀU KHIỂN CHÍNH (PREMIUM TAILADMIN) ---
  return (
    <div className="space-y-4">
      
      {/* 🔔 1. THANH THÔNG BÁO TÌNH BÁO (INTEL BANNER) - HIỆN KHI PAUSE */}
      {isPaused && (
        <div className={`w-full p-4 rounded-2xl flex items-center justify-center gap-2.5 border shadow-sm transition-colors ${intelMessage.includes("HIGH IMPACT") ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-[#111827] border-slate-800 text-slate-400'}`}>
            {intelMessage.includes("HIGH IMPACT") ? <ShieldAlert size={18} className="animate-pulse"/> : <Radio size={18}/>}
            <span className="text-[11px] font-bold uppercase tracking-wider">{intelMessage}</span>
        </div>
      )}

      {/* 2. BẢNG ĐIỀU KHIỂN */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 shadow-sm ${isPaused ? 'bg-[#111827] border-amber-500/30' : 'bg-[#111827] border-emerald-500/30'}`}>
        
        <div className="flex items-center gap-5 w-full md:w-auto">
          {/* Icon Trạng Thái */}
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl border ${isPaused ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
            {isPaused ? <ZapOff size={24} /> : <Activity size={24} className="animate-pulse" />}
          </div>
          
          {/* Text Trạng Thái */}
          <div>
            <h4 className={`text-xl font-bold tracking-tight uppercase ${isPaused ? 'text-amber-500' : 'text-emerald-500'}`}>
              {isPaused ? "CEASEFIRE (PAUSED)" : "COMBAT READY"}
            </h4>
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5 mt-1">
              System Status: 
              <span className={isPaused ? "text-amber-400" : "text-emerald-400"}>
                {isPaused ? "Defensive Mode Active" : "Scanning Market"}
              </span>
            </p>
          </div>
        </div>

        {/* Nút Bấm */}
        <button 
          onClick={handleToggle}
          disabled={loading}
          className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex justify-center items-center gap-2 ${
            isPaused 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-70' 
              : 'bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-70'
          }`}
        >
          {loading ? <Loader2 size={16} className="animate-spin"/> : (isPaused ? <Zap size={16}/> : <ZapOff size={16}/>)}
          {loading ? "TRANSMITTING..." : (isPaused ? "RESUME MISSION" : "PAUSE BOT")}
        </button>
      </div>
    </div>
  );
};
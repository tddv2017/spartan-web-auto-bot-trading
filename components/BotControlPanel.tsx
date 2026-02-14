"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Zap, ZapOff, ShieldAlert, Activity, Lock, Radio } from 'lucide-react';

export const BotControlPanel = ({ userData }: { userData: any }) => {
  const [loading, setLoading] = useState(false);
  
  // 1. Lấy trạng thái thực từ Firestore (Real-time)
  // Khi Admin bấm nút bên trang Admin, biến này tự động đổi thành "PAUSE"
  const isPaused = userData?.remoteCommand === "PAUSE";
  
  // 2. Lấy thông điệp tình báo từ Admin (Ví dụ: "⚠️ HIGH IMPACT NEWS")
  const intelMessage = userData?.intelMessage || "MARKET STABLE";
  
  // 3. Kiểm tra xem có bị Admin khóa cứng (STOP/Lock Key) không
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
        // Nếu khách tự bấm, đổi thông báo thành mặc định
        intelMessage: newStatus === "PAUSE" ? "PAUSED BY USER" : "MARKET STABLE"
      });
    } catch (e) { alert("Lỗi kết nối!"); }
    setLoading(false);
  };

  // --- GIAO DIỆN KHÓA (KHI HẾT HẠN HOẶC VI PHẠM) ---
  if (isLockedByAdmin) {
    return (
      <div className="p-6 rounded-[2rem] border-2 bg-red-950/20 border-red-500/50 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-red-500/20 text-red-500">
            <Lock size={28} />
          </div>
          <div>
            <h4 className="text-xl font-black tracking-tighter text-red-500">SYSTEM LOCKED</h4>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Contact Admin for support</p>
          </div>
        </div>
        <button disabled className="px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-slate-800 text-slate-500 cursor-not-allowed">
          DISABLED
        </button>
      </div>
    );
  }

  // --- GIAO DIỆN ĐIỀU KHIỂN CHÍNH ---
  return (
    <div className="space-y-4">
      
      {/* 🔔 1. THANH THÔNG BÁO TÌNH BÁO (INTEL BANNER) - HIỆN KHI PAUSE */}
      {isPaused && (
        <div className={`w-full p-3 rounded-xl flex items-center justify-center gap-2 border ${intelMessage.includes("HIGH IMPACT") ? 'bg-orange-500/10 border-orange-500 text-orange-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            {intelMessage.includes("HIGH IMPACT") ? <ShieldAlert size={18}/> : <Radio size={18}/>}
            <span className="text-xs font-black uppercase tracking-widest">{intelMessage}</span>
        </div>
      )}

      {/* 2. BẢNG ĐIỀU KHIỂN */}
      <div className={`p-6 rounded-[2rem] border-2 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-500 ${isPaused ? 'bg-orange-950/10 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 'bg-green-950/10 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]'}`}>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Icon Trạng Thái */}
          <div className={`p-4 rounded-2xl ${isPaused ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
            {isPaused ? <ZapOff size={28} /> : <Activity size={28} className="animate-pulse" />}
          </div>
          
          {/* Text Trạng Thái */}
          <div>
            <h4 className={`text-xl font-black tracking-tighter ${isPaused ? 'text-orange-500' : 'text-green-500'}`}>
              {isPaused ? "CEASEFIRE (PAUSED)" : "COMBAT READY"}
            </h4>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              Status: 
              <span className={isPaused ? "text-orange-400" : "text-green-400"}>
                {isPaused ? "Defensive Mode Active" : "Scanning Market"}
              </span>
            </p>
          </div>
        </div>

        {/* Nút Bấm */}
        <button 
          onClick={handleToggle}
          disabled={loading}
          className={`w-full md:w-auto px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
            isPaused 
              ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20 text-white border-b-4 border-green-800' 
              : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20 text-white border-b-4 border-orange-800'
          }`}
        >
          {loading ? "TRANSMITTING..." : (isPaused ? "RESUME MISSION" : "PAUSE BOT")}
        </button>
      </div>
    </div>
  );
};
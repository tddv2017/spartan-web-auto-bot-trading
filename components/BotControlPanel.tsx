"use client";
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { PlayCircle, PauseCircle, Activity, ShieldAlert } from 'lucide-react';

export const BotControlPanel = ({ userData }: { userData: any }) => {
  const [loading, setLoading] = useState(false);
  
  // Kiểm tra trạng thái: Nếu Key là STOP thì coi là đang tạm dừng
  const isPaused = userData?.licenseKey === "STOP";

  const handleToggle = async () => {
    // ⚠️ PHƯƠNG ÁN BẠO LỰC: GHI ĐÈ LICENSE KEY
    if (isPaused) {
      // LÚC KHỞI ĐỘNG LẠI (RESUME)
      if (!userData.backupKey) {
        alert("❌ LỖI NGHIÊM TRỌNG: Không tìm thấy Key dự phòng (backupKey) để khôi phục!");
        return;
      }
      
      if (!confirm(`Khôi phục mã License: ${userData.backupKey}?`)) return;

      setLoading(true);
      try {
        const userRef = doc(db, "users", userData.id || userData.uid);
        await updateDoc(userRef, {
          licenseKey: userData.backupKey, // Trả lại Key thật
          // Xóa trường backupKey sau khi dùng xong cho sạch
          backupKey: null 
        });
      } catch (e) { alert("Lỗi: " + e); }
    } else {
      // LÚC TẠM DỪNG (PAUSE)
      if (!confirm("⚠️ CẢNH BÁO BẠO LỰC!\n\nMã License của khách sẽ bị đổi thành 'STOP' ngay lập tức.\nBot của khách sẽ báo lỗi bản quyền và dừng lại.\n\nBạn đã BACKUP dữ liệu chưa?")) return;

      setLoading(true);
      try {
        const userRef = doc(db, "users", userData.id || userData.uid);
        await updateDoc(userRef, {
          backupKey: userData.licenseKey, // Lưu Key thật vào kho dự phòng trước
          licenseKey: "STOP"              // Ghi đè chữ STOP vào trường chính
        });
      } catch (e) { alert("Lỗi: " + e); }
    }
    setLoading(false);
  };

  return (
    <div className={`p-5 rounded-[2rem] border flex items-center justify-between transition-all duration-300 ${isPaused ? 'bg-red-900/10 border-red-500/30' : 'bg-green-900/10 border-green-500/30'}`}>
      <div className="flex items-center gap-4">
        <div className={isPaused ? "text-red-500" : "text-green-500"}>
          {isPaused ? <ShieldAlert size={32}/> : <Activity size={32} className="animate-pulse"/>}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
            Manual Override Unit
          </p>
          <h4 className={`text-lg font-black italic tracking-tighter ${isPaused ? 'text-red-500' : 'text-green-500'}`}>
            {isPaused ? "LICENSE STATUS: STOPPED" : "LICENSE STATUS: ACTIVE"}
          </h4>
        </div>
      </div>

      <button 
        onClick={handleToggle}
        disabled={loading}
        className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
            isPaused 
            ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]' 
            : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
        }`}
      >
        {loading ? "..." : (isPaused ? "RESTORE BOT" : "STOP BOT")}
      </button>
    </div>
  );
};
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { ShieldAlert, Zap, ZapOff, DatabaseBackup, Loader2 } from 'lucide-react';

export const EmergencyPanel = ({ onRefresh, adminUser }: { onRefresh: () => void, adminUser: any }) => {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    if (!confirm("💾 SAO LƯU DỮ LIỆU TOÀN BỘ HỆ THỐNG?")) return;
    setLoading(true);
    try {
      const token = await adminUser.getIdToken(); 
      const res = await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.success ? "✅ BACKUP THÀNH CÔNG!" : "❌ Lỗi: " + data.message);
    } catch (e: any) { alert("❌ Lỗi mạng!"); }
    setLoading(false);
  };

  const handleEmergencyStop = async () => {
    if (!confirm("⚠️ KÍCH HOẠT TRẠNG THÁI NGỪNG BẮN TOÀN HỆ THỐNG?")) return;
    setLoading(true);
    try {
      const batch = writeBatch(db); 
      const querySnapshot = await getDocs(collection(db, "users"));
      let count = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.accountStatus === 'active') {
          batch.update(doc.ref, { remoteCommand: "PAUSE", intelMessage: "⚠️ HIGH IMPACT NEWS - PAUSED", lastEmergencyAt: new Date().toISOString() });
          count++;
        }
      });
      if (count > 0) { await batch.commit(); alert(`🚨 ĐÃ DỪNG ${count} CHIẾN HẠM!`); } 
      onRefresh(); 
    } catch (e) { alert("❌ Lỗi: " + e); }
    setLoading(false);
  };

  const handleRestore = async () => {
    if (!confirm("✅ KHÔI PHỤC TRẠNG THÁI CHIẾN ĐẤU?")) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const querySnapshot = await getDocs(collection(db, "users"));
      let count = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.remoteCommand === "PAUSE") {
          batch.update(doc.ref, { remoteCommand: "RUN", intelMessage: "MARKET STABLE", lastResumeAt: new Date().toISOString() });
          count++;
        }
      });
      if (count > 0) { await batch.commit(); alert(`⚔️ ${count} CHIẾN HẠM HOẠT ĐỘNG LẠI!`); }
      onRefresh();
    } catch (e) { alert("❌ Lỗi!"); }
    setLoading(false);
  };

  return (
    <div className="bg-[#111827] border border-red-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(239,68,68,0.05)] relative overflow-hidden">
      {/* Cảnh báo nền đỏ nhạt */}
      <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
        
        {/* Tiêu đề & Icon */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
            <ShieldAlert className="text-red-500 animate-pulse" size={28}/>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-500 tracking-tight uppercase">Emergency Command</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Bảng điều khiển hỏa lực khẩn cấp</p>
          </div>
        </div>

        {/* Cụm Nút Bấm */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Nút Backup */}
          <button 
            onClick={handleBackup} 
            disabled={loading} 
            className="flex-1 lg:flex-none px-6 py-3 bg-[#1e293b] hover:bg-slate-700 border border-slate-600 text-blue-400 font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin"/> : <DatabaseBackup size={18}/>} 
            SAO LƯU DB
          </button>
          
          {/* Nút Dừng Khẩn Cấp */}
          <button 
            onClick={handleEmergencyStop} 
            disabled={loading} 
            className="flex-1 lg:flex-none px-6 py-3 bg-red-600/10 hover:bg-red-600 border border-red-500/50 hover:border-red-500 text-red-500 hover:text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin"/> : <ZapOff size={18}/>} 
            NGỪNG BẮN TOÀN CỤC
          </button>
          
          {/* Nút Khôi Phục */}
          <button 
            onClick={handleRestore} 
            disabled={loading} 
            className="flex-1 lg:flex-none px-6 py-3 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/50 hover:border-emerald-500 text-emerald-500 hover:text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin"/> : <Zap size={18}/>} 
            KHÔI PHỤC CHIẾN ĐẤU
          </button>
        </div>
      </div>
    </div>
  );
};
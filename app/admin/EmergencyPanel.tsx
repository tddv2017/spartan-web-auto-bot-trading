import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { ShieldAlert, Zap, ZapOff } from 'lucide-react';

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
    <div className="bg-red-900/10 border border-red-500/30 rounded-3xl p-6 mb-8 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-600/20 rounded-2xl border border-red-500/50">
            <ShieldAlert className="text-red-500 animate-pulse" size={32}/>
          </div>
          <div>
            <h3 className="text-2xl font-black text-red-500 italic tracking-tighter uppercase">Supreme Command Console</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Điều khiển hỏa lực khẩn cấp</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={handleBackup} disabled={loading} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"><span className="text-xl">💾</span> BACKUP</button>
          <button onClick={handleEmergencyStop} disabled={loading} className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 border-b-4 border-orange-800"><ZapOff size={20}/> CEASEFIRE</button>
          <button onClick={handleRestore} disabled={loading} className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 border-b-4 border-green-800"><Zap size={20}/> ENGAGE</button>
        </div>
      </div>
    </div>
  );
};
"use client";
import React, { useState } from 'react';
import { db } from '@/lib/firebase'; 
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'; 
import { Clock, Users, ShieldCheck, Send, ExternalLink, XCircle, AlertTriangle } from 'lucide-react';

export const VerificationLock = ({ user, profile }: { user: any, profile: any }) => {
  const [mt5Input, setMt5Input] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const status = profile?.accountStatus || 'new';

  const REG_LINK = "https://one.exnessonelink.com/a/skd31a2pdu"; 
  const TELEGRAM_ADMIN = "https://t.me/MyGold_M15_Bot"; 

  const handleRetry = async () => {
      try { await updateDoc(doc(db, "users", user.uid), { accountStatus: 'new' }); } 
      catch (e) { console.error(e); }
  };

  const handleSubmitMT5 = async () => {
    if (!mt5Input || mt5Input.trim().length < 5) { alert("⚠️ Vui lòng nhập ID MT5 hợp lệ!"); return; }
    setIsSubmitting(true);
    try {
      const mt5Number = parseInt(mt5Input.trim());
      if (isNaN(mt5Number)) { alert("⛔ ID MT5 phải là số!"); setIsSubmitting(false); return; }
      
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        mt5Account: mt5Number,
        accountStatus: 'pending', 
        submittedAt: new Date().toISOString(), 
        lastUpdated: serverTimestamp() 
      });
    } catch (error: any) { 
        console.error("Lỗi:", error); alert(`❌ Lỗi: ${error.message}`);
    } finally { setIsSubmitting(false); }
  };

  // --- PENDING STATE ---
  if (status === 'pending') {
    return (
      <div className="bg-[#111827] border border-amber-500/30 p-8 rounded-2xl text-center max-w-lg mx-auto mt-12 shadow-lg shadow-amber-500/5">
        <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <Clock size={32} className="text-amber-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">HỒ SƠ ĐANG CHỜ DUYỆT</h2>
        <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800/60 mb-6 inline-block min-w-[200px]">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">MT5 ID Yêu Cầu</p>
            <p className="text-2xl font-mono font-bold text-amber-400 tracking-tight">{profile?.mt5Account || mt5Input}</p>
        </div>
        <p className="text-sm text-slate-400 mb-8">Hệ thống đang đối soát dữ liệu MT5. Quá trình này thường diễn ra trong 5-15 phút.</p>
        
        <a href={TELEGRAM_ADMIN} target="_blank" className="inline-flex items-center justify-center w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-colors">
            <Send size={16}/> NHẮN ADMIN DUYỆT NHANH
        </a>
        <div className="mt-6 pt-4 border-t border-slate-800">
            <button onClick={handleRetry} className="text-[11px] font-semibold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-wider">
                Nhập sai số? Hủy và nhập lại
            </button>
        </div>
      </div>
    );
  }

  // --- REJECTED STATE ---
  if (status === 'rejected') {
    return (
      <div className="bg-[#111827] border border-red-500/30 p-8 rounded-2xl max-w-lg mx-auto mt-12 shadow-lg shadow-red-500/5">
        <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wider text-center">YÊU CẦU BỊ TỪ CHỐI</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">Tài khoản MT5 <span className="text-white font-mono font-bold">{profile?.mt5Account}</span> không hợp lệ hoặc chưa thỏa điều kiện.</p>
        
        <div className="bg-red-950/20 border border-red-900/30 p-5 rounded-xl mb-8">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-400" size={16}/>
                <strong className="text-sm text-red-400 uppercase tracking-wider">Lý do phổ biến:</strong>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
                <li>Chưa đăng ký qua link đối tác (Mã: <strong>skd31a2pdu</strong>)</li>
                <li>Loại tài khoản không hỗ trợ (Cần Standard/Raw)</li>
                <li>Nhập sai định dạng ID MT5</li>
            </ul>
        </div>
        <button onClick={handleRetry} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-colors uppercase tracking-wider">
            KHAI BÁO LẠI ID KHÁC
        </button>
      </div>
    );
  }

  // --- NEW (ONBOARDING) STATE ---
  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            KÍCH HOẠT <span className="text-blue-500">SPARTAN BOT</span>
        </h1>
        <p className="text-slate-400 text-sm">Vui lòng hoàn tất thủ tục định danh hệ thống để truy cập Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BƯỚC 1 */}
        <div className="bg-[#111827] border border-slate-800 p-8 rounded-2xl relative flex flex-col hover:border-slate-700 transition-colors shadow-sm">
          <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider">Bước 01</div>
          <div className="mb-6 w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20"><Users size={24} className="text-blue-500"/></div>
          
          <h3 className="text-lg font-bold text-white mb-2 tracking-tight">TẠO TÀI KHOẢN MỚI</h3>
          <p className="text-sm text-slate-400 mb-6 flex-grow leading-relaxed">
            Yêu cầu bắt buộc: Đăng ký tài khoản Exness qua liên kết nội bộ. Nếu đã có tài khoản cũ, vui lòng mở ID mới với mã IB: 
            <span className="block mt-3 bg-[#0B1120] p-2.5 rounded-lg text-emerald-400 font-mono font-bold text-center border border-slate-800 select-all">t7uxs4x192</span>
          </p>
          
          <a href={REG_LINK} target="_blank" className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl text-sm font-bold transition-colors">
            ĐĂNG KÝ EXNESS <ExternalLink size={16}/>
          </a>
        </div>

        {/* BƯỚC 2 */}
        <div className="bg-[#111827] border border-slate-800 p-8 rounded-2xl relative flex flex-col hover:border-slate-700 transition-colors shadow-sm">
          <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider">Bước 02</div>
          <div className="mb-6 w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20"><ShieldCheck size={24} className="text-emerald-500"/></div>
          
          <h3 className="text-lg font-bold text-white mb-2 tracking-tight">XÁC MINH ID MT5</h3>
          <p className="text-sm text-slate-400 mb-6 flex-grow leading-relaxed">
            Nhập số ID MT5 (Real Account) vừa tạo. Hệ thống Radar sẽ tự động đối soát và cấp quyền truy cập nếu hợp lệ.
          </p>
          
          <div className="space-y-4 mt-auto">
            <input 
                type="number" 
                placeholder="Nhập ID MT5 (VD: 12345678)" 
                className="w-full bg-[#0B1120] border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-3.5 text-white font-mono text-sm outline-none transition-all placeholder:text-slate-600" 
                value={mt5Input} 
                onChange={(e) => setMt5Input(e.target.value)} 
            />
            <button 
                onClick={handleSubmitMT5} 
                disabled={isSubmitting} 
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
                {isSubmitting ? "ĐANG GỬI DỮ LIỆU..." : <>GỬI YÊU CẦU DUYỆT <Send size={16}/></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; 
import { doc, updateDoc } from 'firebase/firestore'; 
import { Clock, Users, ShieldCheck, Send, ExternalLink, X } from 'lucide-react';

export const VerificationLock = ({ user, profile }: { user: any, profile: any }) => {
  const [mt5Input, setMt5Input] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'new' | 'pending' | 'rejected'>('new');

  const REG_LINK = "https://one.exnessonelink.com/a/t7uxs4x192/?campaign=38979"; 
  const TELEGRAM_ADMIN = "https://t.me/MyGold_M15_Bot"; 

  useEffect(() => {
    if (profile?.accountStatus) { setStatus(profile.accountStatus); } 
    else if (profile?.mt5Account) { setStatus('pending'); }
  }, [profile]);

  const handleSubmitMT5 = async () => {
    if (!mt5Input || mt5Input.length < 5) { alert("Vui lòng nhập đúng ID MT5!"); return; }
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        mt5Account: parseInt(mt5Input),
        accountStatus: 'pending',
        submittedAt: new Date().toISOString()
      });
      setStatus('pending');
      alert("✅ Đã gửi yêu cầu! Vui lòng chờ Admin duyệt.");
    } catch (error) { alert("Lỗi hệ thống! Thử lại sau."); } 
    finally { setIsSubmitting(false); }
  };

  if (status === 'pending') {
    return (
      <div className="bg-slate-900 border border-yellow-600/50 p-8 rounded-[2rem] text-center max-w-2xl mx-auto mt-10 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><Clock size={40} className="text-yellow-500 animate-pulse" /></div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase">HỒ SƠ ĐANG ĐƯỢC DUYỆT</h2>
        <p className="text-slate-400 mb-6">Admin đang kiểm tra tài khoản MT5 <span className="text-white font-mono font-bold">{profile?.mt5Account}</span> của bạn.</p>
        <a href={TELEGRAM_ADMIN} target="_blank" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"><Send size={18} /> NHẮN ADMIN DUYỆT NHANH</a>
        <p className="mt-4 text-xs text-slate-600 cursor-pointer hover:text-red-500" onClick={() => setStatus('new')}>(Debug: Quay lại bước nhập)</p>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="bg-slate-900 border border-red-600/50 p-8 rounded-[2rem] text-center max-w-2xl mx-auto mt-10">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><X size={40} className="text-red-500" /></div>
        <h2 className="text-2xl font-black text-red-500 mb-2 uppercase">YÊU CẦU BỊ TỪ CHỐI</h2>
        <p className="text-slate-400 mb-6">Tài khoản MT5 của bạn không hợp lệ hoặc không nằm trong hệ thống IB.</p>
        <button onClick={() => setStatus('new')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all">THỬ LẠI</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 italic tracking-tighter">KÍCH HOẠT <span className="text-green-500">SPARTAN BOT</span></h1>
        <p className="text-slate-400">Hoàn thành 2 bước dưới đây để nhận Bot và hướng dẫn sử dụng.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-green-500/50 transition-all">
          <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-xs font-black px-3 py-1 rounded-bl-xl">BƯỚC 1</div>
          <div className="mb-4 text-green-500"><Users size={40} /></div>
          <h3 className="text-xl font-black text-white mb-2">ĐĂNG KÝ TÀI KHOẢN</h3>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">Bắt buộc đăng ký tài khoản Exness qua link hoặc code <a href={REG_LINK} target="_blank" className="text-green-400 font-bold mx-1 hover:underline">t7uxs4x192</a>.</p>
          <a href={REG_LINK} target="_blank" className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-900/50 transition-all active:scale-95">ĐĂNG KÝ NGAY <ExternalLink size={16}/></a>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-xs font-black px-3 py-1 rounded-bl-xl">BƯỚC 2</div>
          <div className="mb-4 text-blue-500"><ShieldCheck size={40} /></div>
          <h3 className="text-xl font-black text-white mb-2">XÁC MINH ID</h3>
          <p className="text-sm text-slate-400 mb-4">Nhập ID tài khoản MT5 (Zero/Raw) bạn vừa tạo.</p>
          <div className="space-y-4">
            <input type="number" placeholder="Nhập ID MT5" className="w-full bg-black/50 border border-slate-700 rounded-xl p-4 text-white font-mono focus:border-blue-500 outline-none" value={mt5Input} onChange={(e) => setMt5Input(e.target.value)} />
            <button onClick={handleSubmitMT5} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95">{isSubmitting ? "ĐANG GỬI..." : "GỬI XÁC MINH"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
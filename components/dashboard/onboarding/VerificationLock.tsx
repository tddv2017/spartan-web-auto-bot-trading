"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; 
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Thêm serverTimestamp
import { Clock, Users, ShieldCheck, Send, ExternalLink, X, AlertTriangle } from 'lucide-react';

export const VerificationLock = ({ user, profile }: { user: any, profile: any }) => {
  const [mt5Input, setMt5Input] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State hiển thị dựa trên profile thực tế từ Firestore
  // Nếu profile chưa load xong thì mặc định là 'new'
  const status = profile?.accountStatus || 'new';

  const REG_LINK = "https://one.exnessonelink.com/a/skd31a2pdu"; // Link đăng ký Exness với mã đối tác
  const TELEGRAM_ADMIN = "https://t.me/MyGold_M15_Bot"; 

  // Hàm Reset lại trạng thái (Dành cho trường hợp bị từ chối muốn nhập lại)
  const handleRetry = async () => {
      try {
          await updateDoc(doc(db, "users", user.uid), {
              accountStatus: 'new' // Reset về new để hiện form nhập
          });
      } catch (e) {
          console.error(e);
      }
  };

  const handleSubmitMT5 = async () => {
    // 1. Validate đầu vào
    if (!mt5Input || mt5Input.trim().length < 5) { 
        alert("⚠️ Vui lòng nhập ID MT5 hợp lệ (ít nhất 5 số)!"); 
        return; 
    }

    setIsSubmitting(true);

    try {
      // 2. Ép kiểu sang số nguyên (Quan trọng vì DB lưu dạng số)
      const mt5Number = parseInt(mt5Input.trim());
      
      if (isNaN(mt5Number)) {
          alert("⛔ ID MT5 phải là số!");
          setIsSubmitting(false);
          return;
      }

      // 3. Gửi lên Firestore
      const userRef = doc(db, "users", user.uid);
      
      await updateDoc(userRef, {
        mt5Account: mt5Number,
        accountStatus: 'pending', // Chuyển trạng thái sang chờ duyệt
        submittedAt: new Date().toISOString(), // Lưu thời gian dạng chuỗi ISO
        lastUpdated: serverTimestamp() // Lưu thời gian Server để sort
      });

      // 4. Thông báo (Không cần setStatus thủ công vì profile sẽ tự update qua realtime listener ở cha)
      // alert("✅ Đã gửi yêu cầu thành công! Vui lòng chờ duyệt.");
      
    } catch (error: any) { 
        console.error("Lỗi gửi MT5:", error);
        alert(`❌ Lỗi hệ thống: ${error.message}`);
    } finally { 
        setIsSubmitting(false); 
    }
  };

  // --- GIAO DIỆN: CHỜ DUYỆT (PENDING) ---
  if (status === 'pending') {
    return (
      <div className="bg-slate-900 border border-yellow-600/50 p-8 rounded-[2rem] text-center max-w-2xl mx-auto mt-10 shadow-[0_0_50px_rgba(234,179,8,0.1)] animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full animate-ping"></div>
            <Clock size={40} className="text-yellow-500 relative z-10" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">HỒ SƠ ĐANG ĐƯỢC DUYỆT</h2>
        <div className="bg-black/40 p-4 rounded-xl border border-slate-800 mb-6 inline-block">
            <p className="text-slate-400 text-sm uppercase font-bold mb-1">MT5 ID CỦA BẠN</p>
            <p className="text-3xl font-mono font-black text-yellow-400 tracking-widest">{profile?.mt5Account || mt5Input}</p>
        </div>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Hệ thống đang kiểm tra thông tin. Quá trình này thường mất từ 5-15 phút.</p>
        
        <a href={TELEGRAM_ADMIN} target="_blank" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/50 active:scale-95 group">
            <Send size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"/> NHẮN ADMIN DUYỆT NHANH
        </a>
        
        {/* Nút hủy dành cho trường hợp nhập sai */}
        <div className="mt-8 pt-6 border-t border-slate-800">
            <button onClick={handleRetry} className="text-xs text-slate-500 hover:text-red-500 underline decoration-slate-700 hover:decoration-red-500 transition-all">
                (Nhập sai số MT5? Bấm vào đây để nhập lại)
            </button>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN: BỊ TỪ CHỐI (REJECTED) ---
  if (status === 'rejected') {
    return (
      <div className="bg-slate-900 border border-red-600/50 p-8 rounded-[2rem] text-center max-w-2xl mx-auto mt-10 animate-in shake duration-500">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-wide">YÊU CẦU BỊ TỪ CHỐI</h2>
        <p className="text-slate-400 mb-6">Tài khoản MT5 <span className="text-white font-bold">{profile?.mt5Account}</span> không hợp lệ hoặc chưa đăng ký qua link giới thiệu.</p>
        
        <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl mb-6 text-left flex gap-3 items-start">
            <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20}/>
            <div className="text-sm text-red-200">
                <strong>Lý do phổ biến:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-red-300/80">
                    <li>Chưa nhập mã giới thiệu <strong>skd31a2pdu</strong></li>
                    <li>Tài khoản không phải loại <strong>Standard/Raw/Zero</strong></li>
                    <li>Sai số ID MT5</li>
                </ul>
            </div>
        </div>

        <button onClick={handleRetry} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-600 hover:border-white">
            NHẬP LẠI ID KHÁC
        </button>
      </div>
    );
  }

  // --- GIAO DIỆN: NHẬP MỚI (NEW) ---
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 italic tracking-tighter">
            KÍCH HOẠT <span className="text-green-500">SPARTAN BOT</span>
        </h1>
        <p className="text-slate-400 text-lg">Hoàn thành 2 bước dưới đây để nhận Bot và tín hiệu VIP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* Line nối giữa 2 bước (Chỉ hiện trên Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-slate-600 font-black italic text-xl">VS</div>
        </div>

        {/* BƯỚC 1 */}
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-green-500/30 transition-all z-10 flex flex-col">
          <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-xs font-black px-4 py-2 rounded-bl-2xl border-l border-b border-slate-700">STEP 01</div>
          <div className="mb-6 text-green-500 bg-green-500/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-green-500/20"><Users size={32} /></div>
          
          <h3 className="text-2xl font-black text-white mb-2 uppercase">ĐĂNG KÝ TÀI KHOẢN</h3>
          <p className="text-slate-400 mb-6 flex-grow leading-relaxed">
            Bắt buộc đăng ký tài khoản Exness qua link giới thiệu. Nếu đã có tài khoản, hãy mở thêm ID mới với mã đối tác: 
            <span className="block mt-2 bg-black/50 p-2 rounded text-green-400 font-mono font-bold text-center border border-green-900/50 select-all cursor-pointer hover:bg-green-900/20 transition-colors">t7uxs4x192</span>
          </p>
          
          <a href={REG_LINK} target="_blank" className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-black py-4 rounded-xl font-black shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] transition-all active:scale-95 uppercase tracking-wide">
            ĐĂNG KÝ NGAY <ExternalLink size={18} strokeWidth={3}/>
          </a>
        </div>

        {/* BƯỚC 2 */}
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/30 transition-all z-10 flex flex-col">
          <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-xs font-black px-4 py-2 rounded-bl-2xl border-l border-b border-slate-700">STEP 02</div>
          <div className="mb-6 text-blue-500 bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-blue-500/20"><ShieldCheck size={32} /></div>
          
          <h3 className="text-2xl font-black text-white mb-2 uppercase">XÁC MINH ID MT5</h3>
          <p className="text-slate-400 mb-6 flex-grow">
            Nhập số tài khoản MT5 (ID) mà bạn vừa tạo ở Bước 1. Hệ thống sẽ tự động quét và kích hoạt Bot nếu ID hợp lệ.
          </p>
          
          <div className="space-y-4 mt-auto">
            <div className="relative">
                <input 
                    type="number" 
                    placeholder="Nhập ID MT5 (Ví dụ: 12345678)" 
                    className="w-full bg-black/50 border border-slate-700 focus:border-blue-500 rounded-xl p-4 pl-4 text-white font-mono text-lg outline-none transition-colors placeholder:text-slate-600" 
                    value={mt5Input} 
                    onChange={(e) => setMt5Input(e.target.value)} 
                />
            </div>
            <button 
                onClick={handleSubmitMT5} 
                disabled={isSubmitting} 
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> ĐANG GỬI...</>
                ) : (
                    <>GỬI XÁC MINH <Send size={18} strokeWidth={3}/></>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
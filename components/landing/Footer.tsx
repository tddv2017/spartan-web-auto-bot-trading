"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, Twitter, Mail, ShieldCheck, Heart, MessageCircle, X, Minimize2, User } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function Footer() {
  // 👇 Fix lỗi crash nếu chưa load được ngôn ngữ
  const { t } = useLanguage() || { t: { footer: {} } }; 
  
  // 🔥 STATE CHO CHAT BOX
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Chào Đại tá! 👋 Hệ thống Spartan AI hỗ trợ gì được cho ngài?", sender: "bot" }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  // Hàm gửi tin nhắn giả lập
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    // 1. Thêm tin nhắn của khách
    const newMsg = { id: Date.now(), text: inputMsg, sender: "user" };
    setMessages(prev => [...prev, newMsg]);
    setInputMsg("");

    // 2. Bot trả lời tự động sau 1 giây
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Cảm ơn ngài. Admin đang kết nối, vui lòng để lại Email hoặc Telegram để được hỗ trợ nhanh nhất ạ! 🫡", 
        sender: "bot" 
      }]);
    }, 1200);
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 relative overflow-hidden">
      
      {/* Hiệu ứng nền */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-green-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* CỘT 1: THÔNG TIN */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center font-bold text-black group-hover:rotate-12 transition-transform">S</div>
              <span className="text-xl font-bold tracking-wider font-mono text-white">
                SPARTAN <span className="text-green-500">V7.2</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              Hệ thống giao dịch tự động sử dụng thuật toán AI Dual-Core tiên tiến nhất. 
              Tối ưu hóa lợi nhuận vàng (XAUUSD) với rủi ro thấp nhất thị trường.
            </p>
            
            <div className="flex gap-4">
              <SocialBtn icon={<Send size={18} />} href="https://t.me/support_spartan" label="Telegram" />
              <SocialBtn icon={<Twitter size={18} />} href="#" label="Twitter/X" />
              <SocialBtn icon={<Mail size={18} />} href="mailto:contact@spartan.com" label="Email" />
            </div>
          </div>

          {/* CỘT 2: ĐIỀU HƯỚNG */}
          <div>
            <h4 className="text-white font-bold mb-6 font-mono tracking-wider">NAVIGATION</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/#features" className="hover:text-green-400 transition-colors">Tính năng cốt lõi</Link></li>
              <li><Link href="/#performance" className="hover:text-green-400 transition-colors">Hiệu suất thực tế</Link></li>
              <li><Link href="/#pricing" className="hover:text-green-400 transition-colors">Bảng giá thuê Bot</Link></li>
              <li><Link href="/login" className="hover:text-green-400 transition-colors">Đăng nhập hệ thống</Link></li>
            </ul>
          </div>

          {/* CỘT 3: PHÁP LÝ & SUPPORT */}
          <div>
            <h4 className="text-white font-bold mb-6 font-mono tracking-wider">LEGAL & HELP</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/terms#terms" className="hover:text-green-400 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/terms#policy" className="hover:text-green-400 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              
              {/* 🔥 SỬA LINK NÀY THÀNH NÚT BẬT CHAT BOX */}
              <li>
                <button 
                  onClick={() => setIsChatOpen(true)} 
                  className="hover:text-green-400 transition-colors text-left flex items-center gap-2 group"
                >
                  <MessageCircle size={14} className="group-hover:animate-bounce" />
                  Hỗ trợ trực tuyến (Live Chat)
                </button>
              </li>

              <li className="flex items-center gap-2 text-green-500/80 pt-2">
                <ShieldCheck size={14} /> 
                <span>SSL Secure Payment</span>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>{t?.footer?.rights || "© 2026 Spartan AI. All rights reserved."}</p>
          <div className="flex items-center gap-1">
            <span>Made for Traders with</span>
            <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
            <span>by Spartan AI Team</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🔥 LIVE CHAT WIDGET (FLOATING) */}
      {/* ======================================================== */}
      
      {/* 1. Nút Chat Nổi (Luôn hiện ở góc) */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all hover:scale-110 animate-pulse-slow"
        >
          <MessageCircle size={28} strokeWidth={2.5} />
          {/* Badge thông báo */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>
      )}

      {/* 2. Cửa Sổ Chat */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[90vw] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-black border-2 border-slate-700">S</div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Spartan Support</h3>
                <p className="text-[10px] text-green-400">Đang hoạt động</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Minimize2 size={16}/></button>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-500"><X size={16}/></button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 h-[350px] overflow-y-auto p-4 space-y-4 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mr-2 mt-1"><MessageCircle size={12}/></div>}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-green-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                {msg.sender === 'user' && <div className="w-6 h-6 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center ml-2 mt-1"><User size={12}/></div>}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input 
              type="text" 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Nhập nội dung..." 
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-green-500"
            />
            <button type="submit" className="p-3 bg-green-500 hover:bg-green-400 text-black rounded-xl transition-colors">
              <Send size={18} />
            </button>
          </form>

          {/* Footer Branding */}
          <div className="bg-slate-950 py-1 text-center border-t border-slate-900">
            <p className="text-[9px] text-slate-600 font-mono">POWERED BY SPARTAN AI</p>
          </div>
        </div>
      )}
    </footer>
  );
}

// Component nút mạng xã hội
function SocialBtn({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <a 
      href={href} 
      title={label} 
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-500 hover:text-black hover:border-green-500 transition-all hover:-translate-y-1"
    >
      {icon}
    </a>
  );
}
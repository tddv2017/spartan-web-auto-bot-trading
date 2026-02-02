"use client";
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // 👈 1. Import cái này để bắt sự kiện chuyển trang
import { Send, MessageCircle, Minimize2, Trash2 } from 'lucide-react';
import { useChat } from '@/app/context/ChatContext';

export default function ChatWidget() {
  const { isOpen, setIsOpen, messages, sendMessage, clearChat } = useChat();
  const pathname = usePathname(); // 👈 2. Lấy đường dẫn hiện tại
  
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🔥 3. TỰ ĐỘNG THU NHỎ KHI CHUYỂN TRANG
  useEffect(() => {
    // Mỗi khi pathname thay đổi, đóng chat lại
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Tự động cuộn xuống
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    sendMessage(inputMsg);
    setInputMsg("");
  };

  return (
    <>
      {/* 1. NÚT CHAT NỔI */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all hover:scale-110 animate-pulse-slow"
        >
          <MessageCircle size={28} strokeWidth={2.5} />
          {messages.length > 1 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-white animate-bounce">
              {messages.length - 1}
            </span>
          )}
        </button>
      )}

      {/* 2. CỬA SỔ CHAT */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[350px] max-w-[90vw] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 h-[500px]">
          
          {/* Header */}
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-black border-2 border-slate-700">S</div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Spartan Support</h3>
                <p className="text-[10px] text-green-400 font-mono">ONLINE 24/7</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={clearChat} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors" title="Xóa lịch sử"><Trash2 size={16}/></button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"><Minimize2 size={16}/></button>
            </div>
          </div>

          {/* Nội dung tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/90 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0"><MessageCircle size={12}/></div>}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-green-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Ô nhập liệu */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0">
            <input 
              type="text" 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Gửi tin nhắn cho Admin..." 
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
            />
            <button type="submit" className="p-3 bg-green-500 hover:bg-green-400 text-black rounded-xl transition-colors shadow-lg shadow-green-500/20">
              <Send size={18} />
            </button>
          </form>
          
          <div className="bg-slate-950 py-1 text-center border-t border-slate-900">
            <p className="text-[9px] text-slate-600 font-mono tracking-wider">POWERED BY SPARTAN AI</p>
          </div>
        </div>
      )}
    </>
  );
}
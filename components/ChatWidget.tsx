"use client";
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Send, MessageCircle, Minimize2, Trash2, Cpu } from 'lucide-react'; // Thêm icon Cpu cho ngầu
import { useChat } from '@/app/context/ChatContext';

export default function ChatWidget() {
  const { isOpen, setIsOpen, messages, sendMessage, clearChat } = useChat();
  const pathname = usePathname();
  
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false); // 👈 Trạng thái AI đang nghĩ
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. TỰ ĐỘNG THU NHỎ KHI CHUYỂN TRANG
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // 2. TỰ ĐỘNG CUỘN XUỐNG
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]); // Cuộn cả khi AI đang gõ

  // 3. XỬ LÝ GỬI TIN & GỌI AI
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg(""); // Xóa ô nhập ngay lập tức

    // A. Gửi tin nhắn của User lên giao diện ngay
    // (Lưu ý: sendMessage trong Context phải hỗ trợ tham số thứ 2 là 'user' hoặc 'bot')
    sendMessage(userText, 'user');

    // B. Bật chế độ "Đang suy nghĩ"
    setIsTyping(true);

    try {
      // C. Gọi API về Server (Kết nối Gemini)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await res.json();

      // D. Hiển thị câu trả lời của Bot
      if (data.reply) {
        sendMessage(data.reply, 'bot');
      } else {
        sendMessage("Mất tín hiệu vệ tinh. Vui lòng thử lại.", 'bot');
      }

    } catch (error) {
      console.error("Lỗi Chat:", error);
      sendMessage("⚠️ Hệ thống quá tải. Không thể kết nối AI.", 'bot');
    } finally {
      setIsTyping(false); // Tắt chế độ suy nghĩ
    }
  };

  return (
    <>
      {/* 1. NÚT CHAT NỔI */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all hover:scale-110 animate-pulse-slow group"
        >
          {/* Icon thay đổi khi hover */}
          <MessageCircle size={28} strokeWidth={2.5} className="group-hover:hidden transition-all" />
          <Cpu size={28} strokeWidth={2.5} className="hidden group-hover:block transition-all animate-spin-slow" />
          
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-white animate-bounce">
              {messages.length}
            </span>
          )}
        </button>
      )}

      {/* 2. CỬA SỔ CHAT */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[350px] max-w-[90vw] bg-slate-900 border border-green-900/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 h-[500px] backdrop-blur-sm bg-opacity-95">
          
          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-green-900/30 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center font-bold text-black border-2 border-slate-800 shadow-lg shadow-green-500/20">
                    <Cpu size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm tracking-wide">SPARTAN COMMANDER</h3>
                <p className="text-[10px] text-green-500 font-mono flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                   AI ONLINE
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={clearChat} className="p-2 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition-colors" title="Xóa lịch sử"><Trash2 size={16}/></button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"><Minimize2 size={16}/></button>
            </div>
          </div>

          {/* Nội dung tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 custom-scrollbar">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                    <div className="w-6 h-6 bg-green-900/40 text-green-400 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0 border border-green-900">
                        <Cpu size={12}/>
                    </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm font-sans ${
                  msg.sender === 'user' 
                    ? 'bg-green-700 text-white rounded-tr-none shadow-md shadow-green-900/20' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Hiệu ứng đang gõ */}
            {isTyping && (
                <div className="flex justify-start animate-fade-in">
                    <div className="w-6 h-6 bg-green-900/40 text-green-400 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0 border border-green-900">
                        <Cpu size={12}/>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Ô nhập liệu */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0">
            <input 
              type="text" 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Nhập mật lệnh..." 
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all placeholder:text-slate-600"
              disabled={isTyping}
            />
            <button 
                type="submit" 
                disabled={isTyping || !inputMsg.trim()}
                className={`p-3 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                    isTyping || !inputMsg.trim() 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'
                }`}
            >
              <Send size={18} />
            </button>
          </form>
          
          <div className="bg-slate-950 py-1 text-center border-t border-slate-900">
            <p className="text-[9px] text-slate-600 font-mono tracking-wider flex justify-center gap-1">
                POWERED BY <span className="text-green-800 font-bold">GEMINI AI</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
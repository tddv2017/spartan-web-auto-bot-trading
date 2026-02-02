"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, Twitter, Mail, ShieldCheck, Heart, MessageCircle, Minimize2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useChat } from '@/app/context/ChatContext'; 

export default function Footer() {
  // 👇 Lấy dữ liệu ngôn ngữ
  const { t } = useLanguage(); 
  
  const { isOpen, setIsOpen, messages, sendMessage, clearChat } = useChat();
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-green-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
           
           {/* CỘT 1: THÔNG TIN */}
           <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center font-bold text-black group-hover:rotate-12 transition-transform">S</div>
              <span className="text-xl font-bold tracking-wider font-mono text-white">SPARTAN <span className="text-green-500">V7.2</span></span>
            </Link>
            
            {/* 👇 SỬ DỤNG BIẾN ĐA NGÔN NGỮ */}
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              {t.footer?.description} 
            </p>

            <div className="flex gap-4">
              <SocialBtn icon={<Send size={18} />} href="https://t.me/support_spartan" label="Telegram" />
              <SocialBtn icon={<Twitter size={18} />} href="#" label="Twitter/X" />
              <SocialBtn icon={<Mail size={18} />} href="mailto:contact@spartan.com" label="Email" />
            </div>
          </div>

          {/* CỘT 2: NAVIGATION */}
          <div>
            <h4 className="text-white font-bold mb-6 font-mono tracking-wider">{t.footer?.nav_title || "NAVIGATION"}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {/* 👇 DÙNG TỪ ĐIỂN T.NAV */}
              <li><Link href="/#features" className="hover:text-green-400 transition-colors">{t.nav?.features}</Link></li>
              <li><Link href="/#performance" className="hover:text-green-400 transition-colors">{t.nav?.performance}</Link></li>
              <li><Link href="/#pricing" className="hover:text-green-400 transition-colors">{t.nav?.pricing}</Link></li>
              <li><Link href="/login" className="hover:text-green-400 transition-colors">{t.nav?.login}</Link></li>
            </ul>
          </div>

          {/* CỘT 3: LEGAL & HELP */}
          <div>
            <h4 className="text-white font-bold mb-6 font-mono tracking-wider">{t.footer?.legal_title || "LEGAL & HELP"}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {/* 👇 DÙNG TỪ ĐIỂN T.FOOTER */}
              <li><Link href="/terms#terms" className="hover:text-green-400 transition-colors">{t.footer?.terms}</Link></li>
              <li><Link href="/terms#policy" className="hover:text-green-400 transition-colors">{t.footer?.policy}</Link></li>
              
              <li>
                <button onClick={() => setIsOpen(true)} className="hover:text-green-400 transition-colors text-left flex items-center gap-2 group">
                  <MessageCircle size={14} className="group-hover:animate-bounce" /> 
                  {t.footer?.support}
                </button>
              </li>
              <li className="flex items-center gap-2 text-green-500/80 pt-2"><ShieldCheck size={14} /> <span>SSL Secure Payment</span></li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>{t.footer?.rights}</p>
          <div className="flex items-center gap-1"><span>Made with</span><Heart size={12} className="text-red-500 fill-red-500 animate-pulse" /><span>by Spartan AI Team</span></div>
        </div>
      </div>

      {/* CHAT WIDGET GIỮ NGUYÊN */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all hover:scale-110 animate-pulse-slow">
          <MessageCircle size={28} strokeWidth={2.5} />
          {messages.length > 1 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">1</span>}
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[90vw] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 h-[500px]">
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-black border-2 border-slate-700">S</div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></span>
              </div>
              <div><h3 className="font-bold text-white text-sm">Spartan Support</h3><p className="text-[10px] text-green-400">Online 24/7</p></div>
            </div>
            <div className="flex gap-1">
              <button onClick={clearChat} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400" title="Xóa lịch sử chat"><Trash2 size={16}/></button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Minimize2 size={16}/></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0"><MessageCircle size={12}/></div>}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0">
            <input type="text" value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-green-500" />
            <button type="submit" className="p-3 bg-green-500 hover:bg-green-400 text-black rounded-xl transition-colors"><Send size={18} /></button>
          </form>
        </div>
      )}
    </footer>
  );
}

function SocialBtn({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <a href={href} title={label} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-500 hover:text-black hover:border-green-500 transition-all hover:-translate-y-1">
      {icon}
    </a>
  );
}
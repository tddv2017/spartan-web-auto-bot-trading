"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, Twitter, Mail, ShieldCheck, Heart, MessageCircle, Minimize2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useChat } from '@/app/context/ChatContext'; 

export default function Footer() {
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
    <footer className="bg-[#0B1120] border-t border-slate-800 pt-16 pb-8 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
           
           <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-[#0B1120] text-lg shadow-sm">S</div>
              <span className="text-xl font-bold tracking-tight text-white">SPARTAN <span className="text-emerald-500 font-mono text-sm ml-1 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">V7.3</span></span>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
              {t.footer?.description} 
            </p>

            <div className="flex gap-3">
              <SocialBtn icon={<Send size={18} />} href="https://t.me/support_spartan" label="Telegram" />
              <SocialBtn icon={<Twitter size={18} />} href="#" label="Twitter/X" />
              <SocialBtn icon={<Mail size={18} />} href="mailto:contact@spartan.com" label="Email" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">{t.footer?.nav_title || "NAVIGATION"}</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><Link href="/#features" className="hover:text-emerald-400 transition-colors">{t.nav?.features}</Link></li>
              <li><Link href="/#performance" className="hover:text-emerald-400 transition-colors">{t.nav?.performance}</Link></li>
              <li><Link href="/#pricing" className="hover:text-emerald-400 transition-colors">{t.nav?.pricing}</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">{t.nav?.login}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">{t.footer?.legal_title || "LEGAL & HELP"}</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><Link href="/terms#terms" className="hover:text-emerald-400 transition-colors">{t.footer?.terms}</Link></li>
              <li><Link href="/terms#policy" className="hover:text-emerald-400 transition-colors">{t.footer?.policy}</Link></li>
              <li>
                <button onClick={() => setIsOpen(true)} className="hover:text-emerald-400 transition-colors text-left flex items-center gap-2">
                  <MessageCircle size={16} /> {t.footer?.support}
                </button>
              </li>
              <li className="flex items-center gap-2 text-emerald-500/80 pt-2 font-mono text-xs"><ShieldCheck size={16} /> <span>SSL SECURE PAYMENT</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500">
          <p>{t.footer?.rights}</p>
          <div className="flex items-center gap-1.5 uppercase tracking-wider"><span>Built with</span><Heart size={12} className="text-red-500 fill-red-500" /><span>by Spartan AI Team</span></div>
        </div>
      </div>

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-[#0B1120] shadow-lg transition-transform hover:scale-105">
          <MessageCircle size={24} strokeWidth={2.5} />
          {messages.length > 1 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#0B1120] flex items-center justify-center text-[10px] font-bold text-white">{messages.length - 1}</span>}
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[90vw] bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 h-[500px]">
          <div className="bg-[#0B1120] p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center font-bold text-emerald-500">S</div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0B1120]"></span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Spartan Support</h3>
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mt-0.5">Online 24/7</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={clearChat} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-colors" title="Xóa lịch sử"><Trash2 size={16}/></button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"><Minimize2 size={16}/></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111827] custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <div className="w-8 h-8 bg-[#0B1120] border border-slate-800 text-emerald-500 rounded-xl flex items-center justify-center mr-3 shrink-0"><MessageCircle size={14}/></div>}
                <div className={`max-w-[80%] p-3.5 text-sm ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm' : 'bg-[#0B1120] text-slate-300 border border-slate-800 rounded-2xl rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 bg-[#0B1120] border-t border-slate-800 flex gap-3 shrink-0">
            <input type="text" value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 bg-[#111827] border border-slate-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            <button type="submit" className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors"><Send size={18} /></button>
          </form>
        </div>
      )}
    </footer>
  );
}

function SocialBtn({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <a href={href} title={label} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
      {icon}
    </a>
  );
}
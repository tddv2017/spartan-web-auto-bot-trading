"use client";
import React from 'react';
import Link from 'next/link';
import { Send, Twitter, Mail, ShieldCheck, Heart, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useChat } from '@/app/context/ChatContext'; 

export default function Footer() {
  // 👇 Fix lỗi crash nếu chưa load được ngôn ngữ
  const { t } = useLanguage() || { t: { footer: {} } }; 
  
  // 👇 Chỉ lấy đúng hàm setIsOpen để mở Chat Widget toàn cục
  const { setIsOpen } = useChat(); 

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

          {/* CỘT 3: PHÁP LÝ & HELP */}
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
              
              {/* 👇 NÚT NÀY SẼ KÍCH HOẠT CHAT WIDGET (Đã nằm ở Layout) */}
              <li>
                <button 
                  onClick={() => setIsOpen(true)} 
                  className="hover:text-green-400 transition-colors text-left flex items-center gap-2 group"
                >
                  <MessageCircle size={14} className="group-hover:animate-bounce" />
                  Hỗ trợ trực tuyến
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
            <span>Made with</span>
            <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
            <span>by Spartan AI Team</span>
          </div>
        </div>
      </div>
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
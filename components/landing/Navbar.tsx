"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Dùng Link để chuyển trang
import { Menu, X, Globe, User, LayoutDashboard, LogIn } from 'lucide-react';
import { useLanguage } from '../../app/context/LanguageContext'; // Đường dẫn import
import { useAuth } from '../../app/context/AuthContext'; // Dùng alias @ cho chuẩn (hoặc đường dẫn tương đối)

export default function Navbar() {
  // 1. CHỈ GỌI HOOK 1 LẦN DUY NHẤT
  // (Lưu ý: context trả về 'language' và 'setLanguage', không phải 'lang')
  const { language, setLanguage, t } = useLanguage(); 
  const { user } = useAuth(); // Lấy thông tin user

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hiệu ứng cuộn trang
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'border-b border-white/10 bg-slate-950/80 backdrop-blur-md py-4' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        
        {/* --- 1. LOGO --- */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center font-bold text-black group-hover:scale-110 transition-transform">S</div>
          <span className="text-lg font-bold tracking-wider font-mono text-white">
            SPARTAN <span className="text-green-500">V7.2</span>
          </span>
        </Link>

        {/* --- 2. MENU GIỮA --- */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-green-400 transition-colors">{t.nav.features}</a>
          <a href="#performance" className="hover:text-green-400 transition-colors">{t.nav.performance}</a>
          <a href="#pricing" className="hover:text-green-400 transition-colors">{t.nav.pricing}</a>
        </div>

        {/* --- 3. KHU VỰC BÊN PHẢI --- */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Nút Đổi Ngôn Ngữ (Dùng setLanguage) */}
          <button 
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1 text-xs font-bold border border-slate-700 rounded px-3 py-1.5 hover:border-green-500 transition-colors bg-slate-900/50"
          >
            <Globe className="w-3 h-3 text-slate-400" />
            <span className={language === 'vi' ? 'text-green-500' : 'text-slate-500'}>VN</span>
            <span className="text-slate-600">/</span>
            <span className={language === 'en' ? 'text-green-500' : 'text-slate-500'}>EN</span>
          </button>

          {/* Nút Action: Login hoặc Dashboard (Tùy trạng thái User) */}
          {user ? (
            // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP -> VÀO DASHBOARD
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg text-sm font-bold border border-slate-700 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              {t.nav.dashboard}
            </Link>
          ) : (
            // TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP -> VÀO LOGIN
            <Link 
              href="/login"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-black px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>

        {/* Nút Menu Mobile (Hiện khi màn hình nhỏ) */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>

      </div>
      
      {/* Mobile Menu Dropdown (Optional - Nếu Đại tá muốn làm kỹ phần mobile) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-4 flex flex-col gap-4 shadow-2xl">
           <a href="#features" className="text-slate-300 py-2 border-b border-slate-800" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.features}</a>
           <a href="#pricing" className="text-slate-300 py-2 border-b border-slate-800" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.pricing}</a>
           <Link href="/login" className="bg-green-600 text-black text-center py-3 rounded font-bold" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
        </div>
      )}
    </nav>
  );
}
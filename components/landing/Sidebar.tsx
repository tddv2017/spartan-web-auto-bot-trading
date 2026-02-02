"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  LogOut, 
  History,
  UserCircle,
  CreditCard,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, logout, user, profile } = useAuth();

  const menuItems = [
    { name: 'DASHBOARD', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
    // { name: 'LỊCH SỬ GIAO DỊCH', icon: <History size={22} />, path: '/dashboard/history' },
    // { name: 'HỒ SƠ TÀI KHOẢN', icon: <UserCircle size={22} />, path: '/dashboard/profile' },
    // { name: 'NẠP QUÂN LƯƠNG', icon: <CreditCard size={22} />, path: '/dashboard/billing' },
  ];

  if (isAdmin) {
    menuItems.push({ 
      name: 'TỔNG HÀNH DINH', 
      icon: <ShieldAlert size={22} />, 
      path: '/admin' 
    });
  }

  return (
    // ✨ FIX 1: Thêm group để bắt sự kiện hover toàn cục
    // ✨ FIX 2: Thêm z-50 để đè lên mọi thứ
    <aside className="group fixed left-0 top-0 h-screen w-20 hover:w-[280px] bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out z-50 shadow-2xl flex flex-col overflow-hidden">
      
      {/* --- LOGO AREA --- */}
      <div className="h-20 flex items-center px-4 mb-2 relative">
        {/* Logo Icon (Luôn cố định) */}
        <div className="min-w-[48px] h-12 bg-green-500 rounded-xl flex items-center justify-center text-black font-black text-xl italic shadow-[0_0_15px_rgba(34,197,94,0.4)] z-10">
          S
        </div>

        {/* Logo Text (Trượt ra khi hover) */}
        {/* ✨ FIX 3: whitespace-nowrap để chữ không xuống dòng */}
        <div className="absolute left-20 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 whitespace-nowrap pl-2">
          <h1 className="text-xl font-black italic tracking-tighter text-white">
            SPARTAN <span className="text-green-500">AI</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Trading System</p>
        </div>
      </div>

      {/* --- MENU LIST --- */}
      <nav className="flex-1 px-3 space-y-2 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const isAdminItem = item.path === '/admin';

          return (
            <Link key={item.path} href={item.path} className="block">
              <div 
                className={`relative flex items-center h-12 px-3 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden ${
                  isActive 
                    ? (isAdminItem ? 'bg-red-600/10 text-red-500' : 'bg-green-500/10 text-green-400') 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                {/* Active Indicator (Thanh kẻ dọc bên trái) */}
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full ${isAdminItem ? 'bg-red-500' : 'bg-green-500'}`} />
                )}

                {/* Icon (Luôn căn giữa ô 48px) */}
                <div className="min-w-[24px] flex items-center justify-center z-10">
                  {item.icon}
                </div>

                {/* Text (Hiện ra mượt mà) */}
                {/* ✨ FIX 4: translate-x để tạo hiệu ứng trượt nhẹ */}
                <span className={`ml-4 font-bold text-sm whitespace-nowrap opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75 ${isActive ? '' : 'font-medium'}`}>
                  {item.name}
                </span>

                {/* Hiệu ứng Glow nền khi Active */}
                {isActive && (
                  <div className={`absolute inset-0 opacity-20 blur-xl ${isAdminItem ? 'bg-red-500' : 'bg-green-500'}`}></div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* --- USER FOOTER --- */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center overflow-hidden relative h-12">
          
          {/* Avatar (Luôn hiện) */}
          <div className="min-w-[40px] h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0 z-10">
             {profile?.photoURL ? (
                <img src={profile.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
             ) : (
                <span className="font-bold text-green-500">{profile?.displayName?.[0] || "U"}</span>
             )}
          </div>

          {/* Info (Trượt ra) */}
          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 whitespace-nowrap">
            <p className="text-xs font-bold text-white truncate w-32">{profile?.displayName || "Chiến Binh"}</p>
            <button 
              onClick={logout} 
              className="text-[10px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 mt-0.5"
            >
              <LogOut size={10} /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* --- DECORATION --- */}
      {/* Icon mũi tên gợi ý mở rộng (Chỉ hiện khi đóng) */}
      <div className="absolute top-1/2 -right-3 p-1 bg-slate-800 rounded-full border border-slate-700 text-slate-500 opacity-100 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
        <ChevronRight size={12} />
      </div>

    </aside>
  );
}
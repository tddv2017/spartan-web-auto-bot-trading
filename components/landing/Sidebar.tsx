"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  LogOut, 
  User, 
  ChevronRight,
  History,
  UserCircle,
  CreditCard
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, logout, user, profile } = useAuth();

  // 1. DANH SÁCH MENU CHÍNH
  const menuItems = [
    { name: 'DASHBOARD', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
    { name: 'LỊCH SỬ GIAO DỊCH', icon: <History size={22} />, path: '/dashboard/history' },
    { name: 'TÀI KHOẢN', icon: <UserCircle size={22} />, path: '/dashboard/profile' },
    { name: 'NẠP QUÂN LƯƠNG', icon: <CreditCard size={22} />, path: '/dashboard/billing' },
  ];

  // 2. NẾU LÀ ADMIN THÌ THÊM NÚT ĐẶC BIỆT
  if (isAdmin) {
    menuItems.push({ 
      name: 'TỔNG HÀNH DINH', 
      icon: <ShieldAlert size={22} />, 
      path: '/admin' // Trỏ về trang /admin/page.tsx ta đã làm
    });
  }

  return (
    /* Sidebar: Mặc định w-20, Hover vào group sẽ bung ra w-72 */
    <div className="group fixed left-0 top-0 h-screen w-20 hover:w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col p-4 transition-all duration-300 ease-in-out z-50 overflow-hidden shadow-2xl">
      
      {/* LOGO BRAND */}
      <div className="flex items-center gap-4 px-1 py-6 mb-2">
        <div className="min-w-[40px] h-10 bg-green-500 rounded-xl flex items-center justify-center font-black text-black italic shadow-[0_0_15px_rgba(34,197,94,0.4)] shrink-0 group-hover:rotate-12 transition-transform">
          S
        </div>
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
          <span className="text-xl font-black italic tracking-tighter text-white">
            SPARTAN <span className="text-green-500">BOT</span>
          </span>
          <span className="text-[10px] text-slate-500 font-bold tracking-widest">AUTO TRADING SYSTEM</span>
        </div>
      </div>

      {/* MENU NAVIGATION */}
      <nav className="flex-1 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const isAdminItem = item.path === '/admin';

          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-4 px-3 py-3.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap group/item relative overflow-hidden ${
                isAdminItem 
                  ? (isActive ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-red-500 hover:bg-red-500/10')
                  : (isActive ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-slate-400 hover:bg-slate-800 hover:text-white')
              }`}>
                {/* Icon */}
                <div className={`min-w-[32px] flex justify-center ${isActive ? 'animate-pulse' : ''}`}>
                  {item.icon}
                </div>
                
                {/* Tên Menu (Hiện khi hover sidebar) */}
                <span className="text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  {item.name}
                </span>

                {/* Tooltip khi sidebar thu nhỏ (Hiện tên khi hover vào icon) */}
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/item:opacity-100 group-hover:opacity-0 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-slate-700 font-normal">
                  {item.name}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* USER PROFILE & LOGOUT */}
      <div className="mt-auto border-t border-slate-800 pt-6 space-y-2">
        <div className="flex items-center gap-3 px-1 p-2 rounded-xl bg-slate-950/50 border border-slate-800/50">
          <div className="min-w-[36px] h-9 rounded-full bg-slate-800 border border-slate-600 overflow-hidden flex items-center justify-center shrink-0">
             {/* Lấy ký tự đầu của tên làm Avatar */}
             <span className="font-black text-green-500">{profile?.displayName?.[0] || "U"}</span>
          </div>
          <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <p className="text-xs font-black text-white truncate uppercase">{profile?.displayName || "CHIẾN BINH"}</p>
            <p className="text-[9px] text-slate-500 truncate font-mono">{user?.email}</p>
          </div>
        </div>
        
        <button onClick={logout} className="w-full flex items-center gap-4 px-3 py-3 rounded-xl font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all whitespace-nowrap group/logout">
          <div className="min-w-[32px] flex justify-center group-hover/logout:-translate-x-1 transition-transform"><LogOut size={20} /></div>
          <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">RÚT QUÂN (LOGOUT)</span>
        </button>
      </div>

      {/* ICON GỢI Ý MỞ RỘNG (Chỉ hiện khi thu nhỏ) */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-0 transition-opacity text-slate-700 delay-500 animate-pulse">
        <ChevronRight size={24} />
      </div>
    </div>
  );
}
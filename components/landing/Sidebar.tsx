"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { LayoutDashboard, ShieldAlert, LogOut, User, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, logout, user } = useAuth();

  const menuItems = [
    { name: 'DASHBOARD', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'ADMIN PORTAL', icon: <ShieldAlert size={22} />, path: '/admin-secret-portal' });
  }

  return (
    /* Sidebar có độ rộng mặc định nhỏ (w-20), khi hover vào 'group' sẽ mở rộng (hover:w-64)
    */
    <div className="group fixed left-0 top-0 h-screen w-20 hover:w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 transition-all duration-300 ease-in-out z-50 overflow-hidden shadow-2xl">
      
      {/* Logo: Chuyển từ icon sang chữ khi hover */}
      <div className="flex items-center gap-3 px-2 py-6">
        <div className="min-w-[40px] h-10 bg-green-500 rounded-xl flex items-center justify-center font-black text-black italic shadow-[0_0_15px_rgba(34,197,94,0.4)]">
          S
        </div>
        <span className="text-xl font-black italic tracking-tighter text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          SPARTAN <span className="text-green-500">BOT</span>
        </span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-3 mt-4">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div className={`flex items-center gap-4 px-3 py-3 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              pathname === item.path 
              ? 'bg-green-500 text-black shadow-lg' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}>
              <div className="min-w-[32px] flex justify-center">{item.icon}</div>
              <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="mt-auto border-t border-slate-800 pt-6 space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="min-w-[40px] h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
            {user?.photoURL ? <img src={user.photoURL} alt="avatar" /> : <User className="p-2 text-slate-500" />}
          </div>
          <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <p className="text-xs font-black text-white truncate uppercase">{user?.displayName || "SOLDIER"}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button onClick={logout} className="w-full flex items-center gap-4 px-3 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all whitespace-nowrap">
          <div className="min-w-[32px] flex justify-center"><LogOut size={22} /></div>
          <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">ĐĂNG XUẤT</span>
        </button>
      </div>

      {/* Nút gợi ý (Chỉ hiện khi thu nhỏ) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 group-hover:hidden text-slate-700">
        <ChevronRight size={16} />
      </div>
    </div>
  );
}
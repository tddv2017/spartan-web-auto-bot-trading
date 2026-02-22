"use client";
import React from 'react';
import Link from 'next/link'; 
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  LogOut, 
  House,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, logout, profile } = useAuth();

  const menuItems = [
    { name: 'DASHBOARD', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'TỔNG HÀNH DINH', icon: <House size={20} />, path: '/admin' },
  ];

  if (isAdmin) {
    menuItems.push({ 
      name: 'BATTLEFIELD LIVE', 
      icon: <ShieldAlert size={20} />, 
      path: '/battlefield' 
    });
  }

  return (
    <aside className="group fixed left-0 top-0 h-screen w-20 hover:w-[260px] bg-[#111827] border-r border-slate-800 transition-all duration-300 ease-in-out z-50 flex flex-col overflow-hidden">
      
      <Link 
        href="/" 
        className="h-20 flex items-center px-5 mb-2 relative hover:bg-[#0B1120] transition-colors border-b border-slate-800"
      >
        <div className="min-w-[40px] h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-[#0B1120] font-bold text-lg shadow-sm z-10 shrink-0">
          S
        </div>

        <div className="absolute left-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pl-3">
          <h1 className="text-lg font-bold tracking-tight text-white leading-none">
            SPARTAN
          </h1>
          <p className="text-[9px] text-emerald-500 font-bold tracking-widest uppercase mt-1">Trading System</p>
        </div>
      </Link>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const isAdminItem = item.path === '/admin' || item.path === '/battlefield';

          return (
            <Link key={item.path} href={item.path} className="block">
              <div 
                className={`relative flex items-center h-12 px-3 rounded-xl transition-colors duration-200 overflow-hidden ${
                  isActive 
                    ? (isAdminItem ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20') 
                    : 'text-slate-400 hover:bg-[#0B1120] hover:text-white border border-transparent'
                }`}
              >
                <div className="min-w-[24px] flex items-center justify-center z-10">
                  {item.icon}
                </div>

                <span className={`ml-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-[#0B1120]">
        <div className="flex items-center h-12">
          <div className="min-w-[40px] h-10 rounded-full bg-[#111827] border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
             {profile?.photoURL ? (
                <img src={profile.photoURL} alt="User" className="w-full h-full object-cover" />
             ) : (
                <User size={18} className="text-slate-400" /> // Cần thêm import User từ lucide-react nếu muốn hiện icon User
             )}
          </div>

          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
            <p className="text-xs font-bold text-white truncate w-32">{profile?.displayName || "Chiến Binh"}</p>
            <button 
              onClick={logout} 
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-red-400 flex items-center gap-1.5 mt-1 transition-colors"
            >
              <LogOut size={12} /> THOÁT
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -right-3 p-1 bg-[#111827] rounded-full border border-slate-700 text-slate-500 group-hover:opacity-0 transition-opacity pointer-events-none">
        <ChevronRight size={14} />
      </div>

    </aside>
  );
}

import { User } from 'lucide-react'; // Đã thêm import cho User
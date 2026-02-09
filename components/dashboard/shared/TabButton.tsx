import React from 'react';

export const TabButton = ({ active, onClick, icon, label, badge }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
            active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
    >
        {icon}
        {label}
        {badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                {badge}
            </span>
        )}
    </button>
);
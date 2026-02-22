import React from 'react';

export const TabButton = ({ active, onClick, icon, label, badge }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors relative ${
            active 
            ? 'bg-blue-600 text-white' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
    >
        {icon}
        {label}
        {badge && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                {badge}
            </span>
        )}
    </button>
);
import React from 'react';

export const StatBox = ({ label, value, icon, color = "text-white", size = "normal" }: any) => (
  <div className={`bg-[#111827] border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors shadow-sm group ${size === 'large' ? 'p-8' : 'p-5 md:p-6'}`}>
    <div className="text-slate-500 text-[10px] font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
        <span className={color}>{icon}</span> {label}
    </div>
    <div className={`${size === 'large' ? 'text-3xl' : 'text-2xl'} font-bold tracking-tight truncate ${color}`}>{value}</div>
  </div>
);
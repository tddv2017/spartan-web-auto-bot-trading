import React from 'react';

export const StatBox = ({ label, value, icon, color = "text-white", size = "normal" }: any) => (
  <div className={`bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-sm hover:border-slate-700 transition-all group ${size === 'large' ? 'p-8' : 'p-6'}`}>
    <div className="text-slate-500 text-[10px] font-black mb-3 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-slate-300">{icon} {label}</div>
    <div className={`${size === 'large' ? 'text-3xl' : 'text-2xl'} font-black tracking-tight truncate ${color}`}>{value}</div>
  </div>
);
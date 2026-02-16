import React from 'react';

// Icon quét QR
export const ScanLine = ({ size }: {size:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>
);

// Thẻ thống kê (Total Users, Pending, etc.)
export const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
  <div className={`bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-${color}-500/50 transition-all`}>
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-500`}>
       <Icon size={60} />
    </div>
    <div className="relative z-10">
       <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">{label}</p>
       <h3 className={`text-3xl font-black font-mono text-white`}>{value}</h3>
       {subValue && <p className={`text-xs mt-1 font-bold text-${color}-500`}>{subValue}</p>}
    </div>
  </div>
);

// Nút chuyển Tab (Dashboard, Members, Finance)
export const AdminTabButton = ({ active, onClick, icon: Icon, label, alertCount }: any) => (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-3 px-6 py-4 transition-all duration-300 border-b-2
        ${active ? 'border-green-500 bg-green-500/10 text-white' : 'border-transparent text-slate-500 hover:text-green-400 hover:bg-white/5'}`}
    >
      <Icon size={18} className={active ? "text-green-500" : ""} />
      <span className="font-bold uppercase tracking-widest text-sm">{label}</span>
      {alertCount > 0 && (
          <span className="ml-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{alertCount}</span>
      )}
    </button>
);
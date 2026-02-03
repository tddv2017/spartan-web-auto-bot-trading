"use client";
import React from 'react';
import { Layers, Zap, ShieldCheck, BarChart3, Cpu, Lock } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function Features() {
  const { t } = useLanguage();

  // 🛡️ LÁ CHẮN: Nếu chưa load được dữ liệu features -> Không render gì cả (tránh crash)
  if (!t.features) return null;

  // Mảng Icon tĩnh (Khớp thứ tự với content.ts)
  const icons = [
    <Layers className="w-6 h-6" key="1"/>,
    <Zap className="w-6 h-6" key="2"/>,
    <ShieldCheck className="w-6 h-6" key="3"/>,
    <BarChart3 className="w-6 h-6" key="4"/>,
    <Cpu className="w-6 h-6" key="5"/>,
    <Lock className="w-6 h-6" key="6"/>
  ];

  return (
    <section id="features" className="relative z-10 py-24 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-green-500 font-mono text-sm tracking-widest uppercase mb-2 animate-pulse">
            {t.features.sub}
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white">
            {t.features.title}
          </h3>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.features.items.map((item: any, index: number) => (
            <FeatureCard 
              key={index}
              icon={icons[index]} // Ghép Icon theo số thứ tự
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

// Component Card con (Giữ nguyên)
function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl hover:border-green-500/50 hover:bg-slate-900 transition-all duration-300 group hover:-translate-y-1">
      <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform border border-slate-800 group-hover:border-green-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
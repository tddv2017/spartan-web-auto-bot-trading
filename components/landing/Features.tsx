"use client";
import React from 'react';
import { Layers, Zap, ShieldCheck, BarChart3, Cpu, Lock } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function Features() {
  const { t } = useLanguage();

  if (!t.features) return null;

  const icons = [
    <Layers className="w-5 h-5" key="1"/>,
    <Zap className="w-5 h-5" key="2"/>,
    <ShieldCheck className="w-5 h-5" key="3"/>,
    <BarChart3 className="w-5 h-5" key="4"/>,
    <Cpu className="w-5 h-5" key="5"/>,
    <Lock className="w-5 h-5" key="6"/>
  ];

  return (
    <section id="features" className="relative z-10 py-24 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-emerald-500 font-bold text-xs tracking-widest uppercase mb-3">
            {t.features.sub}
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {t.features.title}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map((item: any, index: number) => (
            <FeatureCard 
              key={index}
              icon={icons[index]} 
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 bg-[#111827] border border-slate-800 rounded-2xl hover:border-slate-600 transition-all duration-300 group shadow-sm hover:shadow-md">
      <div className="w-12 h-12 bg-[#0B1120] rounded-xl flex items-center justify-center text-emerald-500 mb-6 border border-slate-800 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors">
        {icon}
      </div>
      <h4 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
"use client";
import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Check, Zap, Star, Crown } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  const { t } = useLanguage();

  // MẢNG CẤU HÌNH GÓI CƯỚC
  // ⚠️ QUAN TRỌNG: ID phải khớp với logic trong Dashboard
  const plans = [
    {
      id: "starter", // Gói tháng
      data: t.pricing.starter,
      icon: Zap,
      isRecommended: false,
      isPopular: false
    },
    {
      id: "yearly", // Gói năm
      data: t.pricing.yearly,
      icon: Star,
      isRecommended: true, // Tag: Best Choice
      isPopular: false
    },
    {
      id: "LIFETIME", // ⚠️ VIẾT HOA ĐỂ KÍCH HOẠT QUYỀN RESELLER
      data: t.pricing.lifetime,
      icon: Crown,
      isRecommended: false,
      isPopular: true // Tag: Business VIP
    }
  ];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-10 duration-700">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            {t.pricing.title}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            {t.pricing.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              id={plan.id} 
              data={plan.data}
              Icon={plan.icon}
              isRecommended={plan.isRecommended}
              isPopular={plan.isPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// --- COMPONENT CON: THẺ GIÁ ---
const PricingCard = ({ id, data, Icon, isRecommended, isPopular }: any) => {
  return (
    <div className={`
      relative p-8 rounded-[2.5rem] border transition-all duration-500 group hover:-translate-y-2 flex flex-col h-full
      ${isPopular
        ? "bg-slate-900/90 border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.15)] hover:shadow-yellow-500/30"
        : isRecommended
          ? "bg-slate-900/90 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.15)] scale-105 z-10 hover:shadow-green-500/30"
          : "bg-slate-950/50 border-slate-800 hover:border-slate-600"
      }
    `}>
      {/* Badge Tags */}
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-black font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-green-500/40">
          {data.tag}
        </div>
      )}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-yellow-500/40 flex items-center gap-1">
          <Crown size={14} fill="black"/> {data.tag}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg ${isPopular ? "bg-yellow-500 text-black shadow-yellow-500/20" : isRecommended ? "bg-green-500 text-black shadow-green-500/20" : "bg-slate-800 text-slate-400"}`}>
          <Icon size={28} fill="currentColor" />
        </div>
        <h3 className={`text-lg font-bold uppercase tracking-widest mb-2 ${isPopular ? "text-yellow-500" : isRecommended ? "text-green-500" : "text-slate-400"}`}>{data.name}</h3>
        <div className="flex items-baseline justify-center md:justify-start">
          <span className={`text-4xl md:text-5xl font-black ${isPopular ? "text-white" : "text-white"}`}>{data.price}</span>
          <span className="text-slate-500 font-bold ml-2 text-sm">{data.period}</span>
        </div>
      </div>

      {/* Features List */}
      <ul className="space-y-4 mb-8 flex-1">
        {data.features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 group/item">
            <div className={`mt-0.5 p-0.5 rounded-full ${isPopular ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500"}`}>
                <Check size={12} strokeWidth={4} />
            </div>
            <span className="group-hover/item:text-white transition-colors">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Button Action */}
      <Link
        // 👇 LOGIC ĐIỀU HƯỚNG QUAN TRỌNG:
        // Chuyển hướng sang Dashboard kèm tham số ?action=checkout&plan=ID
        href={`/dashboard?action=checkout&plan=${id}`}
        className={`w-full py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 hover:shadow-xl
          ${isPopular
            ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20"
            : isRecommended
              ? "bg-green-500 hover:bg-green-400 text-black shadow-green-500/20"
              : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-500"
          }
        `}
      >
        {isPopular ? <Crown size={18} fill="black" /> : <Zap size={18} fill="currentColor" />}
        {data.btn}
      </Link>
    </div>
  );
}
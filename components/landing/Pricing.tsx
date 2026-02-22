"use client";
import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Check, Zap, Star, Crown } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  const { t } = useLanguage();

  const plans = [
    {
      id: "starter", 
      data: t.pricing.starter,
      icon: Zap,
      isRecommended: false,
      isPopular: false
    },
    {
      id: "yearly", 
      data: t.pricing.yearly,
      icon: Star,
      isRecommended: true, 
      isPopular: false
    },
    {
      id: "LIFETIME", 
      data: t.pricing.lifetime,
      icon: Crown,
      isRecommended: false,
      isPopular: true 
    }
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#0B1120] border-t border-slate-800/50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            {t.pricing.title}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            {t.pricing.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

const PricingCard = ({ id, data, Icon, isRecommended, isPopular }: any) => {
  return (
    <div className={`
      relative p-8 rounded-2xl border transition-all duration-300 flex flex-col h-full bg-[#111827]
      ${isPopular
        ? "border-amber-500/50 shadow-sm hover:border-amber-500"
        : isRecommended
          ? "border-emerald-500 shadow-sm md:-translate-y-4 md:scale-105 z-10 hover:border-emerald-400"
          : "border-slate-800 hover:border-slate-600"
      }
    `}>
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#0B1120] font-bold text-[10px] px-3 py-1 rounded-md uppercase tracking-widest shadow-sm">
          {data.tag}
        </div>
      )}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-[#0B1120] font-bold text-[10px] px-3 py-1 rounded-md uppercase tracking-widest shadow-sm flex items-center gap-1.5">
          <Crown size={12} fill="currentColor"/> {data.tag}
        </div>
      )}

      <div className="mb-8">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm ${isPopular ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : isRecommended ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-[#0B1120] text-slate-400 border border-slate-800"}`}>
          <Icon size={24} />
        </div>
        <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${isPopular ? "text-amber-500" : isRecommended ? "text-emerald-500" : "text-slate-400"}`}>{data.name}</h3>
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-white tracking-tight">{data.price}</span>
          <span className="text-slate-500 font-semibold ml-2 text-xs uppercase tracking-wider">{data.period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {data.features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
            <div className={`mt-0.5 shrink-0 ${isPopular ? "text-amber-500" : "text-emerald-500"}`}>
                <Check size={16} />
            </div>
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/dashboard?action=checkout&plan=${id}`}
        className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors
          ${isPopular
            ? "bg-amber-600 hover:bg-amber-500 text-white"
            : isRecommended
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-[#0B1120] hover:bg-slate-800 text-white border border-slate-700"
          }
        `}
      >
        {data.btn}
      </Link>
    </div>
  );
}
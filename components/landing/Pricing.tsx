"use client";
import React from 'react';
import { CheckCircle2, Zap, Star, Briefcase, Crown, Shield } from 'lucide-react'; 
import { useLanguage } from '@/app/context/LanguageContext';

export default function Pricing() {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="relative z-10 py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t.pricing.title}</h2>
          <p className="text-slate-400 mt-4">{t.pricing.sub}</p>
        </div>

        {/* CHIA 3 CỘT (Cực đẹp trên Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          
          {/* 1. MONTHLY ($30) - NHẬP MÔN */}
          <PricingCard 
            title={t.pricing.starter.name} 
            price={t.pricing.starter.price} 
            period={t.pricing.starter.period}
            btnText={t.pricing.starter.btn}
            features={t.pricing.starter.features}
            icon={<Shield className="w-6 h-6 text-slate-400 mb-2"/>}
          />

          {/* 2. YEARLY ($299) - BEST CHOICE (TO NHẤT) */}
          <div className="relative group transform md:-translate-y-4"> 
             {/* Hiệu ứng Glow Xanh */}
             <div className="absolute inset-0 bg-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <PricingCard 
              title={t.pricing.yearly.name} 
              price={t.pricing.yearly.price} 
              period={t.pricing.yearly.period}
              btnText={t.pricing.yearly.btn}
              features={t.pricing.yearly.features}
              tag={t.pricing.yearly.tag}
              isRecommended={true} 
              icon={<Star className="w-6 h-6 text-blue-400 mb-2 fill-blue-400" />}
            />
          </div>
          
          {/* 3. LIFETIME ($699) - VIP */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition-opacity"></div>
            <PricingCard 
              title={t.pricing.lifetime.name} 
              price={t.pricing.lifetime.price} 
              period={t.pricing.lifetime.period} 
              btnText={t.pricing.lifetime.btn}
              features={t.pricing.lifetime.features}
              tag={t.pricing.lifetime.tag}
              isPopular={true} 
              icon={<Crown className="w-6 h-6 text-purple-400 mb-2" />}
            />
          </div>

        </div>
      </div>
    </section>
  );
}

// Component PricingCard (Giữ nguyên logic cũ)
function PricingCard({ title, price, period, features, btnText, isPopular = false, isRecommended = false, tag, icon }: any) {
  
  const borderColor = isPopular ? 'border-purple-500' : isRecommended ? 'border-blue-500' : 'border-slate-800';
  const shadowColor = isPopular ? 'shadow-purple-900/20' : isRecommended ? 'shadow-blue-900/20' : '';
  // Gói Recommended (Yearly) sẽ có nền sáng hơn chút để nổi bật
  const bgColor = isRecommended ? 'bg-slate-900' : 'bg-slate-950';
  // Gói Recommended sẽ to hơn
  const height = isRecommended ? 'min-h-[550px]' : 'min-h-[500px]';

  return (
    <div className={`relative p-8 border rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-1 ${bgColor} ${borderColor} ${shadowColor} ${isPopular || isRecommended ? 'shadow-xl' : ''} ${height}`}>
      
      {(isPopular || isRecommended) && tag && (
        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap ${
          isPopular ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {tag}
        </span>
      )}

      <div className="mb-8 text-center md:text-left">
        <div className="flex justify-center md:justify-start">{icon}</div>
        <h4 className={`text-sm font-mono mb-2 uppercase tracking-wider ${isPopular ? 'text-purple-400' : isRecommended ? 'text-blue-400' : 'text-slate-400'}`}>
          {title}
        </h4>
        <div className="flex items-baseline justify-center md:justify-start gap-1">
          <span className={`text-5xl font-black ${isPopular ? 'text-purple-400' : isRecommended ? 'text-blue-400' : 'text-white'}`}>{price}</span>
          <span className="text-slate-500 text-sm">{period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feat: string, i: number) => {
           const isReseller = feat.includes("Reseller") || feat.includes("Hoa hồng");
           
           return (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-snug">
                {isReseller ? (
                   <Briefcase className="w-5 h-5 shrink-0 text-yellow-400 animate-pulse" />
                ) : (
                   <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPopular ? 'text-purple-500' : isRecommended ? 'text-blue-500' : 'text-slate-600'}`} />
                )}
                
                <span className={`${isReseller ? "text-yellow-400 font-bold" : ""}`}>
                  {feat}
                </span>
            </li>
           )
        })}
      </ul>

      <button
      // Truyền plan: starter ($30), yearly ($299), hoặc lifetime ($699)
        onClick={() => {
          // Truyền plan: starter ($30), yearly ($299), hoặc lifetime ($699)
          const planType = isPopular ? "lifetime" : isRecommended ? "yearly" : "starter";
          window.location.href = `/dashboard?action=checkout&plan=${planType}`;
          }}
        className={`w-full py-4 rounded-xl text-sm font-bold transition-all ${
        isPopular 
          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
          : isRecommended
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
      }`}>
        {btnText}
      </button>
    </div>
  );
}
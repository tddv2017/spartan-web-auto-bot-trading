"use client";
export default function SentimentMeter({ value = 78 }) {
  const getStatus = (v: number) => {
    if (v > 70) return { label: "STRONG BULLISH", color: "text-green-500", bg: "bg-green-500" };
    if (v < 30) return { label: "STRONG BEARISH", color: "text-red-500", bg: "bg-red-500" };
    return { label: "NEUTRAL", color: "text-yellow-500", bg: "bg-yellow-500" };
  };

  const status = getStatus(value);

  return (
    <div className="p-5 bg-slate-900/50 border border-slate-800 rounded">
      <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">AI Market Sentiment</h3>
      <div className="flex items-end justify-between mb-3">
        {/* Số phần trăm cực lớn - 48px */}
        <span className={`text-5xl font-black font-chakra ${status.color}`}>{value}%</span>
        <span className={`text-xs font-bold uppercase px-2 py-1 rounded bg-slate-950 border border-slate-800 ${status.color}`}>
          {status.label}
        </span>
      </div>
      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${status.bg}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
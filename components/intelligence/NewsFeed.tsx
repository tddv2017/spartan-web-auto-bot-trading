"use client";
import { useEffect, useState } from "react";

interface NewsItem {
  time: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  desc: string;
}

// Nhận thêm props để truyền dữ liệu ra ngoài
export default function NewsFeed({ onIntelUpdate }: { onIntelUpdate?: (note: string, sentiment: number) => void }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news-ai');
      const data = await res.json();
      if (data.success) {
        setNews(data.news);
        // Bắn tín hiệu ra ngoài cho Page mẹ
        if (onIntelUpdate && data.ai_note) {
          onIntelUpdate(data.ai_note, data.sentiment);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntel();
    const interval = setInterval(fetchIntel, 60000); // 60s AI phân tích lại 1 lần
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-xs text-green-500 animate-pulse">📡 ĐANG GIẢI MÃ DỮ LIỆU AI...</div>;

  return (
    <div className="space-y-6">
      {news.map((n, i) => (
        <div key={i} className="group border-b border-slate-800 pb-4 hover:bg-slate-800/40 transition-all cursor-pointer p-2 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-mono text-slate-400 font-bold">{n.time}</span>
            <span className={`text-xs px-2 py-1 rounded font-bold ${
              n.impact === 'HIGH' ? 'bg-red-900/60 text-red-200 border border-red-700' 
              : 'bg-slate-700 text-slate-300'
            }`}>
              {n.impact}
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-100 group-hover:text-green-400 transition-colors uppercase leading-snug font-chakra">
            {n.title}
          </h4>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">"{n.desc}"</p>
        </div>
      ))}
      <button onClick={fetchIntel} className="w-full py-3 mt-4 text-xs font-bold uppercase border border-slate-700 text-slate-400 hover:text-green-400 transition-all rounded">
        ↻ YÊU CẦU PHÂN TÍCH LẠI
      </button>
    </div>
  );
}
"use client"; // Chuyển thành Client Component để dùng State
import { useState } from "react";
import TradingViewChart from "@/components/battlefield/TradingViewChart";
import NewsFeed from "@/components/intelligence/NewsFeed";
import SentimentMeter from "@/components/intelligence/SentimentMeter";

export default function BattlefieldPage() {
  // State để lưu lời khuyên của AI
  const [aiNote, setAiNote] = useState("Đang chờ phân tích từ tổng hành dinh...");
  const [sentiment, setSentiment] = useState(50);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 font-sans">
      {/* ... (Phần Header giữ nguyên) ... */}
      
      {/* HEADER: (Copy lại phần Header của Đại tá vào đây, hoặc giữ nguyên code cũ nếu muốn) */}
      <div className="max-w-[1920px] mx-auto mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
         <h1 className="text-3xl font-black italic tracking-tighter text-green-500 font-chakra">
            SPARTAN BATTLEFIELD <span className="text-white not-italic text-sm ml-4 border border-slate-700 px-2 py-1 rounded">LIVE AI</span>
         </h1>
      </div>

      <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* CÁNH TRÁI: CHART */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="w-full border border-slate-800 rounded bg-slate-900 shadow-2xl min-h-[600px]">
            <TradingViewChart />
          </div>
           {/* ... (Phần Dashboard số liệu giữ nguyên) ... */}
        </div>

        {/* CÁNH PHẢI: AI INTELLIGENCE */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          
          {/* 1. AI NOTE (DYNAMIC) */}
          <div className="p-5 bg-blue-900/10 border border-blue-800 rounded shadow-lg shadow-blue-900/5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-blue-900/20 text-9xl">💡</div>
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                AI Strategist Note
              </h3>
              {/* Hiển thị lời khuyên thật từ AI */}
              <p className="text-base text-blue-100 italic font-medium leading-relaxed">
                "{aiNote}"
              </p>
            </div>
          </div>

          {/* 2. Sentiment Meter (DYNAMIC) */}
          <SentimentMeter value={sentiment} />
          
          {/* 3. News Feed (Có truyền hàm callback) */}
          <div className="flex-1 bg-slate-900/30 border border-slate-800 p-4 overflow-hidden rounded flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-4 border-b border-slate-800 pb-2 flex justify-between items-center">
              AI INTEL FEED <span className="text-red-500 text-xs animate-pulse">● LIVE</span>
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
               {/* Truyền hàm để lấy dữ liệu ngược ra ngoài */}
               <NewsFeed onIntelUpdate={(note, score) => {
                 setAiNote(note);
                 setSentiment(score);
               }} />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
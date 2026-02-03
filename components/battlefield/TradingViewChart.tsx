"use client";
import { useEffect, useRef, memo } from "react";

function TradingViewChart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    container.current.appendChild(widgetContainer);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "OANDA:XAUUSD",
      "interval": "15",
      "timezone": "Asia/Ho_Chi_Minh",
      "theme": "dark",
      "style": "1", // 1 = Nến Nhật
      "locale": "vi_VN",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "hide_side_toolbar": false, // Hiện công cụ vẽ
      "calendar": false,
      
      // 🛡️ NẠP SẴN BỘ CHỈ BÁO SPARTAN (Tương đương)
      "studies": [
        "Moving Average Exponential@tv-basicstudies", // EMA (Đại tá chỉnh thành 336)
        "Bollinger Bands@tv-basicstudies",            // Để xem độ biến động (thay cho ATR)
        "RSI@tv-basicstudies"                         // RSI
      ],

      // Cấu hình các công cụ vẽ mặc định
      "drawings_access": { "type": "black", "tools": [ { "name": "Regression Trend" } ] },
      
      "support_host": "https://www.tradingview.com"
    });

    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container w-full h-[600px] bg-slate-900 border border-slate-800 rounded-sm" ref={container}>
      {/* Widget nạp ở đây */}
    </div>
  );
}

export default memo(TradingViewChart);
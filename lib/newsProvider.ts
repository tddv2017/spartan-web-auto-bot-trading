// lib/newsProvider.ts

export interface NewsEvent {
  date: string;
  symbol: string;
  impact: string;
  event: string;
}

export async function fetchLiveEconomicCalendar(): Promise<NewsEvent[]> {
  try {
    // 🕵️‍♂️ ĐƯỜNG DẪN BÍ MẬT CỦA FOREX FACTORY (JSON)
    // Đây là file dữ liệu mà các Widget của ForexFactory sử dụng
    const url = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
    
    // Gọi lệnh lấy dữ liệu (Không cần API Key gì cả)
    const response = await fetch(url, { 
        next: { revalidate: 300 }, // Cache 5 phút
        headers: {
            // Giả danh trình duyệt để không bị chặn
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) return [];

    // Lọc và chuẩn hóa dữ liệu
    const formattedNews = data
      .filter((item: any) => item.country === "USD") // Chỉ lấy tin USD (cho nhẹ)
      .map((item: any) => {
        // ForexFactory Impact: "Low", "Medium", "High", "Holiday"
        // Chúng ta giữ nguyên để newsService xử lý
        return {
          date: item.date,   // Format của FF: "2026-02-15T19:30:00-04:00" (Rất chuẩn ISO)
          symbol: "USD",     // FF dùng field 'country' là 'USD'
          impact: item.impact, 
          event: item.title
        };
      });

    return formattedNews;

  } catch (error) {
    console.error("❌ [NEWS PROVIDER] Không lấy được dữ liệu ForexFactory:", error);
    // Nếu lỗi, trả về mảng rỗng để hệ thống không crash
    return [];
  }
}
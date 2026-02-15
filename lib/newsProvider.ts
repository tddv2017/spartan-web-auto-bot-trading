// lib/newsProvider.ts

// Định nghĩa cấu trúc tin tức
export interface NewsEvent {
  date: string;      // Thời gian diễn ra (YYYY-MM-DD HH:mm:ss)
  symbol: string;    // Đồng tiền (USD, EUR...)
  impact: string;    // Mức độ: Low, Medium, High
  event: string;     // Tên tin (Non-Farm, CPI...)
}

// // 🔴 HÀM GIẢ LẬP (DÙNG ĐỂ TEST)
// export async function fetchLiveEconomicCalendar(): Promise<NewsEvent[]> {
//   console.log("⚠️ ĐANG CHẠY CHẾ ĐỘ DIỄN TẬP (SIMULATION MODE)");

//   const now = new Date();
//   const future = new Date(now.getTime() + 5 * 60000); // 5 phút nữa

//   return [
//     {
//       // ✅ SỬA LẠI: Dùng chuẩn ISO gốc để đảm bảo khớp giờ 100%
//       date: future.toISOString(),  
//       symbol: "USD",
//       impact: "High",
//       event: "🔥 TEST: FAKE NON-FARM PAYROLL 🔥"
//     }
//   ];
// }  

// 🔑 API KEY (Đại tá đăng ký free tại financialmodelingprep.com để lấy key xịn)
// Đây là key demo, nếu hết hạn Đại tá thay key của mình vào nhé.
const FMP_API_KEY = "j0sM7MKhWBuYtTyl4J5yuAUSjd68ks2J"; 

export async function fetchLiveEconomicCalendar(): Promise<NewsEvent[]> {
  try {
    // Lấy ngày hôm nay
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Gọi API lấy lịch kinh tế
    const url = `https://financialmodelingprep.com/api/v3/economic_calendar?from=${today}&to=${tomorrow}&apikey=${FMP_API_KEY}`;
    
    const response = await fetch(url, { next: { revalidate: 300 } }); // Cache 5 phút
    const data = await response.json();

    if (!Array.isArray(data)) return [];

    // Chuẩn hóa dữ liệu về format chung của Spartan
    return data.map((item: any) => ({
      date: item.date, // Format trả về: "2026-02-14 19:30:00"
      symbol: item.currency,
      impact: item.impact, // Low, Medium, High
      event: item.event
    }));

  } catch (error) {
    console.error("❌ [NEWS PROVIDER] Lỗi lấy tin:", error);
    return [];
  }
}
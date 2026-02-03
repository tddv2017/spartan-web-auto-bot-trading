import { NextResponse } from 'next/server';

export async function GET() {
  console.log("🚀 KÍCH HOẠT GIAO THỨC REST API VỚI MODEL MỚI NHẤT...");

  // 1. LẤY KEY (Đại tá nhớ dán key vào .env.local hoặc dán thẳng vào đây để test)
  const apiKey = process.env.GEMINI_API_KEY || "DÁN_KEY_CỦA_ĐẠI_TÁ_VÀO_ĐÂY_NẾU_ENV_LỖI";

  if (!apiKey || apiKey.includes("DÁN_KEY")) {
    return NextResponse.json(mockData("MISSING_KEY"));
  }

  // Dữ liệu giả lập thị trường
  const currentPrice = (2030 + Math.random() * 10).toFixed(2);
  
  // Prompt
  const promptText = `
    Đóng vai "Tổng tham mưu trưởng Spartan" phân tích Vàng (XAUUSD). Giá: ${currentPrice}.
    Trả về JSON duy nhất (không markdown):
    {
      "sentiment": (số 0-100),
      "ai_note": "Nhận định ngắn gọn, súc tích kiểu quân đội. Ví dụ: Phe Bò kiểm soát cao điểm 2035.",
      "news": [
        { "time": "HH:MM", "impact": "HIGH", "title": "TIÊU ĐỀ (VIẾT HOA)", "desc": "Mô tả ngắn." }
      ] (Tạo 3 tin giả lập)
    }
  `;

  try {
    // ⚠️ QUAN TRỌNG: Dùng model 'gemini-flash-latest' có trong danh sách của Đại tá
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Google API Error: ${response.status}`);
    }

    const data = await response.json();
    let rawText = data.candidates[0].content.parts[0].text;
    
    // Làm sạch JSON
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(rawText);

    console.log("✅ KẾT NỐI THÀNH CÔNG VỚI GEMINI FLASH LATEST!");
    return NextResponse.json({ success: true, ...parsedData });

  } catch (error: any) {
    console.error("⚠️ LỖI KẾT NỐI:", error.message);
    // Nếu lỗi thì dùng dữ liệu giả để web không bị chết
    return NextResponse.json(mockData("AI_ERROR"));
  }
}

// Dữ liệu dự phòng
function mockData(reason: string) {
  return {
    success: true,
    sentiment: 68,
    ai_note: reason === "MISSING_KEY" ? "CHƯA NHẬP KEY" : "MẤT TÍN HIỆU VỆ TINH. DÙNG DỮ LIỆU NỘI BỘ.",
    news: [
      { time: "NOW", impact: "HIGH", title: "SPARTAN SYSTEM", desc: "Đang kích hoạt chế độ dự phòng." },
      { time: "NOW", impact: "MEDIUM", title: "MARKET SCAN", desc: "Quét tín hiệu từ các trạm quan sát." }
    ]
  };
}
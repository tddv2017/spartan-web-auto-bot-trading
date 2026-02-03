import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ reply: "Lỗi: Mất kết nối kho vũ khí (API Key)." });

    // 1. CẤU HÌNH NHÂN CÁCH (SYSTEM PROMPT)
    // Ép AI phải nói chuyện như một chỉ huy quân sự, ngầu và ngắn gọn
    const systemPrompt = `
      Bạn là SPARTAN COMMANDER - AI hỗ trợ giao dịch vàng (XAUUSD).
      Phong cách: Quân sự, dứt khoát, dùng từ ngữ chuyên ngành (Scalp, Swing, Buy, Sell, Stoploss).
      Tuyệt đối không đưa ra lời khuyên tài chính chịu trách nhiệm pháp lý.
      Luôn kết thúc câu bằng giọng điệu khích lệ.
      
      Câu hỏi của lính mới: "${message}"
    `;

    // 2. GỌI GEMINI (Dùng đúng model đã test thành công)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Mất tín hiệu vệ tinh. Xin nhắc lại?";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ reply: "Hệ thống đang bảo trì. Vui lòng thử lại sau." });
  }
}
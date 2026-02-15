import { NextResponse } from 'next/server';
import { checkAndExecuteAutoDefense } from '@/lib/newsService';

// Cấu hình để Next.js không cache kết quả (luôn chạy mới)
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Gọi hàm kiểm tra tin tức từ bộ não newsService
    await checkAndExecuteAutoDefense();
    
    // 2. Trả về kết quả thành công
    return NextResponse.json({ 
        success: true, 
        message: "Defense System Scanned Successfully", 
        timestamp: new Date().toISOString() 
    });

  } catch (error: any) {
    console.error("❌ [CRON ERROR]", error);
    return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 500 }
    );
  }
}
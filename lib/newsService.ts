// lib/newsService.ts
import { adminDb } from '@/lib/firebaseAdmin'; 
import { fetchLiveEconomicCalendar } from './newsProvider';

// ⚙️ CẤU HÌNH PHÒNG THỦ (ĐÃ CẬP NHẬT 45 PHÚT)
const DEFENSE_CONFIG = {
  PAUSE_MINUTES_BEFORE: 60, // ⛔ Dừng trước tin 45 phút
  RESUME_MINUTES_AFTER: 60, // ✅ Chạy lại sau tin 45 phút
  TARGET_CURRENCY: ['USD'], // 💵 Chỉ quan tâm USD
  TARGET_IMPACT: ['High', 'Medium'] // 🌪️ Chỉ bão cấp 2 và cấp 3 (ForexFactory viết hoa chữ cái đầu)
};

export async function checkAndExecuteAutoDefense() {
  console.log("📡 [INTEL] Đang quét radar tìm tin tức nguy hiểm...");
  
  // 1. Lấy tin từ nguồn ForexFactory
  const allNews = await fetchLiveEconomicCalendar();
  const now = new Date();
  
  let dangerDetected = false;
  let dangerReason = "";

  // 2. Phân tích từng tin
  for (const news of allNews) {
    // Lọc tiền tệ (USD)
    if (!DEFENSE_CONFIG.TARGET_CURRENCY.includes(news.symbol)) continue;
    // Lọc mức độ (High/Medium)
    if (!DEFENSE_CONFIG.TARGET_IMPACT.includes(news.impact)) continue;

    // Tính khoảng cách thời gian (Phút)
    // new Date(news.date) hoạt động tốt với chuẩn ISO của ForexFactory
    const newsTime = new Date(news.date);
    const diffMinutes = (newsTime.getTime() - now.getTime()) / 1000 / 60;

    // VÙNG NGUY HIỂM: Từ [-45p ... TIN ... +45p]
    if (diffMinutes <= DEFENSE_CONFIG.PAUSE_MINUTES_BEFORE && diffMinutes >= -DEFENSE_CONFIG.RESUME_MINUTES_AFTER) {
      dangerDetected = true;
      dangerReason = `⚠️ NEWS: ${news.event} (${news.impact})`;
      console.log(`🚨 PHÁT HIỆN MỐI ĐE DỌA: ${news.event} | Thời gian: ${news.date}`);
      break; // Chỉ cần 1 tin nguy hiểm là đủ để kích hoạt phòng thủ
    }
  }

  // 3. RA QUYẾT ĐỊNH
  if (dangerDetected) {
    // 🛑 NGUY HIỂM -> PAUSE TOÀN BỘ
    await broadcastCommand("PAUSE", dangerReason);
  } else {
    // ✅ AN TOÀN -> MỞ LẠI TOÀN BỘ (AUTO RESUME)
    // Lưu ý: Hàm broadcastCommand bên dưới đã có logic check, 
    // nếu Bot đang RUN rồi thì nó sẽ không spam database, rất tối ưu.
    console.log("✅ [INTEL] Không có tin tức nguy hiểm. Bầu trời trong xanh.");
    await broadcastCommand("RUN", "MARKET STABLE");
  }
}

// 🔥 HÀM PHÁT LỆNH (DÙNG ADMIN SDK)
async function broadcastCommand(command: "PAUSE" | "RUN", intelMsg: string) {
  const batch = adminDb.batch();
  const usersRef = adminDb.collection("users");
  const snapshot = await usersRef.get(); 
  
  let count = 0;
  snapshot.forEach((doc) => {
    const userData = doc.data();
    
    // 🛡️ CƠ CHẾ AN TOÀN:
    // 1. Chỉ update nếu trạng thái thay đổi (để tiết kiệm tài nguyên)
    // 2. KHÔNG BAO GIỜ can thiệp vào các tài khoản bị Admin khóa cứng (licenseKey = "STOP")
    if (userData.remoteCommand !== command && userData.licenseKey !== "STOP") {
        batch.update(doc.ref, {
            remoteCommand: command,
            intelMessage: intelMsg,
            lastAutoUpdate: new Date().toISOString()
        });
        count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`⚡ [COMMAND] Đã phát lệnh ${command} tới ${count} đơn vị. Lý do: ${intelMsg}`);
  } else {
    // console.log(`💤 [IDLE] Hệ thống đã đồng bộ, không cần phát lệnh mới.`);
  }
}
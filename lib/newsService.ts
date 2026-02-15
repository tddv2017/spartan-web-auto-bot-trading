// lib/newsService.ts
import { adminDb } from '@/lib/firebaseAdmin'; // 👈 Dùng Admin DB thay vì db thường
import { fetchLiveEconomicCalendar } from './newsProvider';

// ⚙️ CẤU HÌNH PHÒNG THỦ
const DEFENSE_CONFIG = {
  PAUSE_MINUTES_BEFORE: 45,
  RESUME_MINUTES_AFTER: 45,
  TARGET_CURRENCY: ['USD'],
  TARGET_IMPACT: ['High', 'Medium'] 
};

export async function checkAndExecuteAutoDefense() {
  console.log("📡 [INTEL] Đang quét radar tìm tin tức nguy hiểm...");
  
  const allNews = await fetchLiveEconomicCalendar();
  const now = new Date();
  
  let dangerDetected = false;
  let dangerReason = "";

  // ... (Logic lọc tin giữ nguyên như cũ) ...
  for (const news of allNews) {
    if (!DEFENSE_CONFIG.TARGET_CURRENCY.includes(news.symbol)) continue;
    if (!DEFENSE_CONFIG.TARGET_IMPACT.includes(news.impact)) continue;

    const newsTime = new Date(news.date);
    const diffMinutes = (newsTime.getTime() - now.getTime()) / 1000 / 60;

    if (diffMinutes <= DEFENSE_CONFIG.PAUSE_MINUTES_BEFORE && diffMinutes >= -DEFENSE_CONFIG.RESUME_MINUTES_AFTER) {
      dangerDetected = true;
      dangerReason = `⚠️ NEWS: ${news.event} (${news.impact})`;
      console.log(`🚨 PHÁT HIỆN MỐI ĐE DỌA: ${news.event}`);
      break; 
    }
  }

  if (dangerDetected) {
    await broadcastCommand("PAUSE", dangerReason);
  } else {
    console.log("✅ [INTEL] Không có tin tức nguy hiểm.");
  }
}

// 🔥 HÀM PHÁT LỆNH (DÙNG ADMIN SDK)
async function broadcastCommand(command: "PAUSE" | "RUN", intelMsg: string) {
  // Admin SDK cú pháp hơi khác Client SDK một chút
  const batch = adminDb.batch();
  const usersRef = adminDb.collection("users");
  const snapshot = await usersRef.get(); // Admin dùng .get() thay vì getDocs()
  
  let count = 0;
  snapshot.forEach((doc) => {
    const userData = doc.data();
    // Logic: Chỉ update nếu khác trạng thái và không bị khóa cứng
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
  }
}
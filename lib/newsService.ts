// lib/newsService.ts
import { adminDb } from '@/lib/firebaseAdmin'; 
import { fetchLiveEconomicCalendar } from './newsProvider';

// ⚙️ THIẾT QUÂN LUẬT: 60p (Đỏ) - 30p (Cam)
const DEFENSE_CONFIG = {
  HIGH_IMPACT: { before: 60, after: 60 },
  MEDIUM_IMPACT: { before: 30, after: 30 },
  TARGET_CURRENCY: ['USD']
};

export async function checkAndExecuteAutoDefense() {
  console.log("📡 [RADAR] Đang quét tin tức Forex Factory...");
  
  const allNews = await fetchLiveEconomicCalendar();
  // 🔥 LẤY GIỜ CHUẨN UTC CỦA SERVER
  const nowUTC = new Date(); 
  
  let dangerDetected = false;
  let dangerReason = "";

  for (const news of allNews) {
    if (!DEFENSE_CONFIG.TARGET_CURRENCY.includes(news.symbol)) continue;

    // 🕵️‍♂️ XỬ LÝ MÚI GIỜ: Forex Factory trả về ISO string chuẩn UTC
    const newsTime = new Date(news.date);
    
    // Tính khoảng cách phút (Chính xác theo miligiây)
    const diffMinutes = (newsTime.getTime() - nowUTC.getTime()) / 1000 / 60;

    let isDangerous = false;

    // 1. Phân loại Tin Đỏ
    if (news.impact === "High") {
      if (diffMinutes <= DEFENSE_CONFIG.HIGH_IMPACT.before && 
          diffMinutes >= -DEFENSE_CONFIG.HIGH_IMPACT.after) {
        isDangerous = true;
      }
    }
    // 2. Phân loại Tin Cam
    else if (news.impact === "Medium") {
      if (diffMinutes <= DEFENSE_CONFIG.MEDIUM_IMPACT.before && 
          diffMinutes >= -DEFENSE_CONFIG.MEDIUM_IMPACT.after) {
        isDangerous = true;
      }
    }

    if (isDangerous) {
      dangerDetected = true;
      const timeRemaining = diffMinutes > 0 ? `trong ${Math.round(diffMinutes)}p tới` : `vừa ra ${Math.abs(Math.round(diffMinutes))}p trước`;
      dangerReason = `⚠️ NEWS: ${news.event} (${news.impact}) ${timeRemaining}`;
      console.log(`🚨 BÁO ĐỘNG: ${news.event} [${news.impact}] | ${timeRemaining}`);
      break; 
    }
  }

  // 📡 PHÁT LỆNH CHỈ HUY
  if (dangerDetected) {
    await broadcastCommand("PAUSE", dangerReason);
  } else {
    console.log("✅ [SAFE] Thị trường ổn định. Không có bão tin.");
    await broadcastCommand("RUN", "MARKET STABLE");
  }
}

// ... (Hàm broadcastCommand Đại tá giữ nguyên như cũ)

async function broadcastCommand(command: "PAUSE" | "RUN", intelMsg: string) {
  const batch = adminDb.batch();
  const usersRef = adminDb.collection("users");
  const snapshot = await usersRef.get(); 
  
  let count = 0;
  snapshot.forEach((doc) => {
    const userData = doc.data();
    // 🛡️ Chỉ update nếu trạng thái thay đổi và không bị Admin khóa thủ công (licenseKey = STOP)
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
    console.log(`⚡ [COMMAND] Phát lệnh ${command}. Lý do: ${intelMsg}`);
  }
}
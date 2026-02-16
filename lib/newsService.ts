// lib/newsService.ts
import { adminDb } from '@/lib/firebaseAdmin'; 
import { fetchLiveEconomicCalendar } from './newsProvider';

const DEFENSE_CONFIG = {
  HIGH_IMPACT: { before: 60, after: 60 },
  MEDIUM_IMPACT: { before: 30, after: 30 },
  TARGET_CURRENCY: ['USD']
};

export async function checkAndExecuteAutoDefense() {
  console.log("📡 [RADAR] Đang quét tin tức Forex Factory...");
  
  const allNews = await fetchLiveEconomicCalendar();
  const nowUTC = new Date(); 
  
  let dangerDetected = false;
  let dangerReason = "";

  for (const news of allNews) {
    if (!DEFENSE_CONFIG.TARGET_CURRENCY.includes(news.symbol)) continue;

    const newsTime = new Date(news.date);
    const diffMinutes = (newsTime.getTime() - nowUTC.getTime()) / 1000 / 60;

    let isDangerous = false;

    if (news.impact === "High") {
      if (diffMinutes <= DEFENSE_CONFIG.HIGH_IMPACT.before && 
          diffMinutes >= -DEFENSE_CONFIG.HIGH_IMPACT.after) {
        isDangerous = true;
      }
    }
    else if (news.impact === "Medium") {
      if (diffMinutes <= DEFENSE_CONFIG.MEDIUM_IMPACT.before && 
          diffMinutes >= -DEFENSE_CONFIG.MEDIUM_IMPACT.after) {
        isDangerous = true;
      }
    }

    if (isDangerous) {
      dangerDetected = true;
      const timeRemaining = diffMinutes > 0 ? `trong ${Math.round(diffMinutes)}p tới` : `vừa ra ${Math.abs(Math.round(diffMinutes))}p trước`;
      // 🔥 Gắn nhãn nhận diện tin tức
      dangerReason = `⚠️ NEWS: ${news.event} (${news.impact}) ${timeRemaining}`;
      console.log(`🚨 BÁO ĐỘNG: ${news.event} [${news.impact}] | ${timeRemaining}`);
      break; 
    }
  }

  if (dangerDetected) {
    await broadcastCommand("PAUSE", dangerReason);
  } else {
    console.log("✅ [SAFE] Thị trường ổn định. Không có bão tin.");
    // 📡 Gửi lệnh RUN nhưng có kèm theo logic check bên dưới
    await broadcastCommand("RUN", "MARKET STABLE");
  }
}

async function broadcastCommand(command: "PAUSE" | "RUN", intelMsg: string) {
  const batch = adminDb.batch();
  const usersRef = adminDb.collection("users");
  const snapshot = await usersRef.get(); 
  
  let count = 0;
  snapshot.forEach((doc) => {
    const userData = doc.data();

    // 🛡️ CHIẾN THUẬT BẢO VỆ LỆNH ADMIN (MANUAL OVERRIDE)
    // Nếu Máy muốn gửi lệnh RUN, nhưng trạng thái hiện tại đang là PAUSE 
    // và thông báo cũ KHÔNG chứa từ khóa "⚠️ NEWS:", tức là do Admin bấm tay.
    // -> Bỏ qua, không cho phép RUN tự động.
    if (command === "RUN" && 
        userData.remoteCommand === "PAUSE" && 
        userData.intelMessage && 
        !userData.intelMessage.includes("⚠️ NEWS:")) {
      return; 
    }

    // Chỉ update nếu trạng thái thực sự thay đổi
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
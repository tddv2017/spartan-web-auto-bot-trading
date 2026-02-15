// lib/newsService.ts
import { adminDb } from '@/lib/firebaseAdmin'; 
import { fetchLiveEconomicCalendar } from './newsProvider';

// ⚙️ CẤU HÌNH "THIẾT QUÂN LUẬT" ĐỒNG BỘ VỚI MT5
const DEFENSE_CONFIG = {
  HIGH_IMPACT: { 
    minutesBefore: 60, // 🔴 Tin Đỏ: Dừng trước 60p
    minutesAfter: 60   // 🔴 Tin Đỏ: Chạy lại sau 60p
  },
  MEDIUM_IMPACT: { 
    minutesBefore: 30, // 🟠 Tin Cam: Dừng trước 30p
    minutesAfter: 30   // 🟠 Tin Cam: Chạy lại sau 30p
  },
  TARGET_CURRENCY: ['USD'] // 💵 Chỉ theo dõi USD
};



export async function checkAndExecuteAutoDefense() {
//     // 🚩 DÒNG LỆNH DIỄN TẬP (Xóa sau khi test xong)
// return await broadcastCommand("PAUSE", "🚨 diễn tập: BÃO TIN CẤP 3!");
  console.log("📡 [INTEL] Đang quét radar Forex Factory...");
  
  const allNews = await fetchLiveEconomicCalendar();
  const now = new Date();
  
  let dangerDetected = false;
  let dangerReason = "";

  for (const news of allNews) {
    if (!DEFENSE_CONFIG.TARGET_CURRENCY.includes(news.symbol)) continue;

    const newsTime = new Date(news.date);
    const diffMinutes = (newsTime.getTime() - now.getTime()) / 1000 / 60;

    // 🌪️ PHÂN LOẠI VÀ QUÉT VÙNG NGUY HIỂM
    let isDangerous = false;

    // 1. Kiểm tra Tin Đỏ (High Impact)
    if (news.impact === "High") {
      if (diffMinutes <= DEFENSE_CONFIG.HIGH_IMPACT.minutesBefore && 
          diffMinutes >= -DEFENSE_CONFIG.HIGH_IMPACT.minutesAfter) {
        isDangerous = true;
      }
    }
    // 2. Kiểm tra Tin Cam (Medium Impact)
    else if (news.impact === "Medium") {
      if (diffMinutes <= DEFENSE_CONFIG.MEDIUM_IMPACT.minutesBefore && 
          diffMinutes >= -DEFENSE_CONFIG.MEDIUM_IMPACT.minutesAfter) {
        isDangerous = true;
      }
    }

    if (isDangerous) {
      dangerDetected = true;
      dangerReason = `⚠️ NEWS: ${news.event} (${news.impact})`;
      console.log(`🚨 PHÁT HIỆN BÃO: ${news.event} [${news.impact}] | Còn ${diffMinutes.toFixed(0)} phút`);
      break; 
    }
  }

  // 3. PHÁT LỆNH TOÀN QUÂN
  if (dangerDetected) {
    await broadcastCommand("PAUSE", dangerReason);
  } else {
    console.log("✅ [INTEL] Bầu trời trong xanh. Thị trường ổn định.");
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
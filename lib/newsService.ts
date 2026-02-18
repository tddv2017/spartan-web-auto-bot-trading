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
  
  // 1. Lấy dữ liệu tin tức
  const allNews = await fetchLiveEconomicCalendar();
  const nowUTC = new Date(); 
  
  let dangerDetected = false;
  let dangerReason = "";

  // 2. Phân tích từng tin
  for (const news of allNews) {
    if (!DEFENSE_CONFIG.TARGET_CURRENCY.includes(news.symbol)) continue;

    const newsTime = new Date(news.date);
    // Tính chênh lệch phút (Tin tương lai là dương, tin quá khứ là âm)
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
      
      // 🔥 Gắn nhãn
      dangerReason = `⚠️ NEWS: ${news.event} (${news.impact}) ${timeRemaining}`;
      console.log(`🚨 BÁO ĐỘNG: ${news.event} [${news.impact}] | ${timeRemaining}`);
      break; // Chỉ cần 1 tin nguy hiểm là kích hoạt phòng thủ ngay
    }
  }

  // 3. Ra lệnh toàn hệ thống
  if (dangerDetected) {
    // 🔥 SỬA LỖI 1: Thêm tham số true (Có bão)
    await broadcastCommand("PAUSE", dangerReason, true);
  } else {
    console.log("✅ [SAFE] Thị trường ổn định. Không có bão tin.");
    // 🔥 SỬA LỖI 1: Thêm tham số false (Yên bình)
    await broadcastCommand("RUN", "MARKET STABLE", false);
  }
}

// ==============================================================================
// 👇 HÀM PHÁT THANH (BROADCAST)
// ==============================================================================
async function broadcastCommand(command: "PAUSE" | "RUN", intelMsg: string, isDanger: boolean) {
  const batch = adminDb.batch();
  const usersRef = adminDb.collection("users");
  const snapshot = await usersRef.get(); 

  // Xác định cờ báo động để Python đọc (HIGH/LOW)
  const newsAlertStatus = isDanger ? "HIGH" : "LOW";
  
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

    // 🔥 SỬA LỖI 3: Update khi Command thay đổi HOẶC trạng thái Tin tức thay đổi
    // (Ví dụ: Vẫn đang RUN, nhưng tin tức chuyển từ HIGH về LOW thì cũng phải update)
    if (userData.remoteCommand !== command || 
        userData.newsAlert !== newsAlertStatus || 
        userData.intelMessage !== intelMsg) {
        
        // Bỏ qua user đã bị Admin chặn vĩnh viễn (STOP)
        if (userData.licenseKey !== "STOP") {
            batch.update(doc.ref, {
                remoteCommand: command,
                intelMessage: intelMsg,
                newsAlert: newsAlertStatus, // <--- Python V1.8 cần cái này
                lastAutoUpdate: new Date().toISOString()
            });
            count++;
        }
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`⚡ [BROADCAST] Đã cập nhật cho ${count} users. CMD: ${command} | Alert: ${newsAlertStatus}`);
  } else {
    console.log(`💤 [BROADCAST] Không có thay đổi nào cần cập nhật.`);
  }
}
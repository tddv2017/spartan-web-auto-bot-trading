const fs = require('fs');
const path = require('path');

// ⚙️ CẤU HÌNH: Nếu dự án không dùng thư mục 'src', hãy xóa 'src/' đi
const BASE_PATH = 'components/dashboard'; 

const structure = {
  folders: [
    'shared',
    'modals',
    'onboarding',
    'tabs'
  ],
  files: {
    'shared/StatBox.tsx': '// 1. Paste code StatBox vào đây',
    'shared/TabButton.tsx': '// 2. Paste code TabButton vào đây',
    'modals/GuideModal.tsx': '// 3. Paste code GuideModal vào đây',
    'onboarding/VerificationLock.tsx': '// 4. Paste code VerificationLock vào đây',
    'tabs/OverviewTab.tsx': '// 5. Paste code OverviewTab vào đây',
    'tabs/WarRoomTab.tsx': '// 6. Paste code WarRoomTab vào đây',
    'tabs/PartnerTab.tsx': '// 7. Paste code PartnerTab vào đây'
  }
};

console.log(`🚀 Đang khởi tạo cấu trúc tại: ${BASE_PATH}...`);

// 1. Tạo thư mục gốc
if (!fs.existsSync(BASE_PATH)) {
  fs.mkdirSync(BASE_PATH, { recursive: true });
}

// 2. Tạo các thư mục con
structure.folders.forEach(folder => {
  const dirPath = path.join(BASE_PATH, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Đã tạo thư mục: ${folder}`);
  }
}); 

// 3. Tạo các file rỗng (Nếu chưa có)
Object.entries(structure.files).forEach(([fileName, content]) => {
  const filePath = path.join(BASE_PATH, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`📄 Đã tạo file: ${fileName}`);
  } else {
    console.log(`⚠️ File đã tồn tại (Bỏ qua): ${fileName}`);
  }
});

console.log('🎉 HOÀN TẤT! SẴN SÀNG COPY CODE!');
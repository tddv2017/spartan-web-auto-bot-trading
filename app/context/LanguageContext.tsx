"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { content } from '../lib/content'; // Đảm bảo đường dẫn đúng tới file content

// Định nghĩa kiểu dữ liệu
type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any; // Dữ liệu từ điển
}

// 1. KHỞI TẠO CONTEXT VỚI GIÁ TRỊ MẶC ĐỊNH AN TOÀN
// (Quan trọng: Phải có hàm rỗng () => {} để tránh lỗi "is not a function")
const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  setLanguage: () => {}, // <--- ĐÂY LÀ CÁI KHIÊN CHỐNG LỖI
  t: content.vi,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Mặc định là tiếng Việt
  const [language, setLanguageState] = useState<Language>('vi');

  // Hàm bọc để setLanguage (có thể mở rộng lưu vào localStorage sau này)
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Lấy từ điển dựa trên ngôn ngữ hiện tại
  // Nếu content[language] bị lỗi thì fallback về content.vi
  const t = content[language] || content.vi;

  return (
    // 2. TRUYỀN ĐỦ 3 GIÁ TRỊ VÀO PROVIDER
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook để sử dụng ở các nơi khác
export const useLanguage = () => useContext(LanguageContext);
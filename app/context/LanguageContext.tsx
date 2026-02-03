"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { content } from '@/lib/content'; 

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any; 
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  setLanguage: () => {}, 
  t: content.vi,
});

const STORAGE_KEY = 'spartan_language'; // 🔑 Chìa khóa kho lưu trữ

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. Khởi tạo mặc định là 'vi' để tránh lỗi Hydration (Server khác Client)
  const [language, setLanguageState] = useState<Language>('vi');

  // 2. useEffect: Chạy 1 lần duy nhất khi Web vừa tải xong
  useEffect(() => {
    // Kiểm tra xem trong kho đã có ngôn ngữ lưu chưa
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
    
    // Nếu có (vi hoặc en) thì set lại ngay
    if (savedLang === 'vi' || savedLang === 'en') {
      setLanguageState(savedLang);
    }
  }, []);

  // 3. Hàm setLanguage mới: Vừa đổi State, vừa Lưu vào kho
  const setLanguage = (lang: Language) => {
    setLanguageState(lang); // Đổi giao diện ngay lập tức
    localStorage.setItem(STORAGE_KEY, lang); // 💾 Lưu vĩnh viễn vào trình duyệt
  };

  // Lấy từ điển
  const t = content[language] || content.vi;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
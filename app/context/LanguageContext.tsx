"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { content } from '@/lib/content'; // 👈 IMPORT FILE VỪA TẠO

type Language = 'vi' | 'en';
type Translations = typeof content.vi; // Tự động lấy kiểu dữ liệu từ file content

// Định nghĩa kiểu cho Context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Lấy ngôn ngữ từ LocalStorage (để reload không bị mất)
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    const savedLang = localStorage.getItem('spartan_lang') as Language;
    if (savedLang) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('spartan_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: content[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
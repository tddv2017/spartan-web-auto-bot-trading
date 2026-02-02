"use client";
import { Be_Vietnam_Pro, Chakra_Petch } from "next/font/google"; 
import "./globals.css";
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext'; // 👈 1. QUAN TRỌNG: Thêm ChatProvider
import ChatWidget from '@/components/ChatWidget'; // 👈 1. Import mới

// 1. Cấu hình Font
const beVietnam = Be_Vietnam_Pro({ 
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});

const chakra = Chakra_Petch({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
});

// 🛡️ ROOT LAYOUT TỔNG (Chỉ chứa các Provider)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className={`${beVietnam.variable} ${chakra.variable} antialiased bg-slate-950 text-slate-200`}>
        <AuthProvider>
          <LanguageProvider>
            <ChatProvider>
              
              {children}
              
              {/* 👇 2. ĐẶT CHAT WIDGET Ở ĐÂY (Nằm ngoài cùng để phủ sóng toàn bộ) */}
              <ChatWidget />

            </ChatProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
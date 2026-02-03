"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// Định nghĩa cấu trúc tin nhắn
interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp?: Date; // Thêm timestamp cho chuyên nghiệp
}

// Định nghĩa các hàm sẽ dùng chung
interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  // ⚠️ QUAN TRỌNG: Cập nhật dòng này để nhận thêm tham số sender
  sendMessage: (text: string, sender?: "user" | "bot") => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Tin nhắn mặc định của Bot
  const defaultMsg: Message = { 
    id: 1, 
    text: "Báo cáo! Spartan Commander đã sẵn sàng. Đại tá cần tham vấn gì về thị trường? 🫡", 
    sender: "bot",
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<Message[]>([defaultMsg]);

  // 1. LOAD LỊCH SỬ TỪ LOCAL STORAGE
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMsg = localStorage.getItem("spartan_chat_history");
      const savedStatus = localStorage.getItem("spartan_chat_open");
      
      if (savedMsg) {
        try {
            setMessages(JSON.parse(savedMsg));
        } catch (e) {
            console.error("Lỗi đọc lịch sử chat", e);
        }
      }
      if (savedStatus) setIsOpen(savedStatus === "true");
    }
  }, []);

  // 2. LƯU LỊCH SỬ (Chạy mỗi khi tin nhắn thay đổi)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("spartan_chat_history", JSON.stringify(messages));
      localStorage.setItem("spartan_chat_open", String(isOpen));
    }
  }, [messages, isOpen]);

  // 3. HÀM GỬI TIN NHẮN (ĐÃ NÂNG CẤP)
  const sendMessage = (text: string, sender: 'user' | 'bot' = 'user') => {
    setMessages(prev => [...prev, { 
        id: Date.now(), 
        text, 
        sender, // Lưu rõ ai là người gửi
        timestamp: new Date() 
    }]);
  };

  const clearChat = () => {
    setMessages([defaultMsg]);
    if (typeof window !== "undefined") {
        localStorage.removeItem("spartan_chat_history");
    }
  };

  return (
    <ChatContext.Provider value={{ isOpen, setIsOpen, messages, sendMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
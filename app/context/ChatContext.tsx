"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  sendMessage: (text: string) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mặc định có tin nhắn chào
  const defaultMsg: Message = { id: 1, text: "Chào Đại tá! 👋 Hệ thống Spartan AI hỗ trợ gì được cho ngài?", sender: "bot" };
  const [messages, setMessages] = useState<Message[]>([defaultMsg]);

  // 1. LOAD LỊCH SỬ TỪ LOCAL STORAGE (Khi mới vào web)
  useEffect(() => {
    const savedMsg = localStorage.getItem("spartan_chat_history");
    const savedStatus = localStorage.getItem("spartan_chat_open");
    
    if (savedMsg) setMessages(JSON.parse(savedMsg));
    if (savedStatus) setIsOpen(savedStatus === "true");
  }, []);

  // 2. LƯU LỊCH SỬ VÀO LOCAL STORAGE (Mỗi khi có tin mới)
  useEffect(() => {
    localStorage.setItem("spartan_chat_history", JSON.stringify(messages));
    localStorage.setItem("spartan_chat_open", String(isOpen));
  }, [messages, isOpen]);

  // 3. HÀM GỬI TIN NHẮN & BOT TRẢ LỜI
  const sendMessage = (text: string) => {
    const newMsg: Message = { id: Date.now(), text, sender: "user" };
    setMessages((prev) => [...prev, newMsg]);

    // Bot trả lời tự động sau 1.5s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now() + 1, 
          text: "Cảm ơn ngài. Admin đang kết nối, vui lòng để lại Email hoặc Telegram để được hỗ trợ nhanh nhất ạ! 🫡", 
          sender: "bot" 
        }
      ]);
    }, 1500);
  };

  const clearChat = () => {
    setMessages([defaultMsg]);
    localStorage.removeItem("spartan_chat_history");
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
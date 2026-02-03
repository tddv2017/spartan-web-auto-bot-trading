"use client"; // Bắt buộc dùng cho Next.js App Router

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase'; // Đại tá kiểm tra lại đường dẫn import này
import { 
  collectionGroup, 
  query, 
  where, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';

// Định nghĩa cấu trúc dữ liệu Trade
interface Trade {
  id: string;
  ticket: number;
  symbol: string;
  type: string; // "BUY" hoặc "SELL"
  profit: number;
  closeTime?: string;
  createdAt?: Timestamp;
  mt5Account?: number;
  licenseKey?: string;
}

export default function LivePerformance() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ CẤU HÌNH QUAN TRỌNG:
  // Đại tá thay đúng License Key trong Bot vào đây để Rada bắt sóng
  const TARGET_LICENSE_KEY = "SPARTAN-DEMO"; 

  useEffect(() => {
    // 📡 KÍCH HOẠT RADA QUÉT TOÀN CẦU (Collection Group Query)
    // Thay vì tìm trong users/{uid}/trades, ta tìm trong tất cả collection tên là "trades"
    const tradesQuery = query(
      collectionGroup(db, 'trades'),
      where('licenseKey', '==', TARGET_LICENSE_KEY)
      // Lưu ý: Nếu muốn thêm orderBy('createdAt', 'desc'), Đại tá cần tạo Index trong Firebase Console
      // (Khi chạy nó sẽ báo lỗi kèm link tạo Index, bấm vào là xong)
    );

    console.log(`📡 Đang quét tín hiệu cho Key: ${TARGET_LICENSE_KEY}...`);

    const unsubscribe = onSnapshot(tradesQuery, (snapshot) => {
      const tradeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Trade[];

      // Sắp xếp dữ liệu (Mới nhất lên đầu) - Xử lý phía Client để đỡ phải tạo Index phức tạp
      tradeData.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA; 
      });

      console.log("🔥 Đã nhận dữ liệu chiến trường:", tradeData);
      setTrades(tradeData);
      setLoading(false);
    }, (error) => {
      console.error("❌ Lỗi mất tín hiệu vệ tinh:", error);
      setLoading(false);
    });

    // Hủy đăng ký khi thoát màn hình
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="p-8 text-center text-green-500 animate-pulse bg-gray-900 rounded-lg border border-green-900">
      📡 ĐANG KẾT NỐI VỆ TINH QUÂN SỰ...
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-1 bg-gray-900 text-gray-100 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-green-400 flex items-center gap-2">
          <span className="text-xl">🔰</span> SPARTAN LIVE FEED
        </h2>
        <div className="text-xs bg-gray-900 px-3 py-1 rounded-full border border-gray-600 text-gray-400 font-mono">
          KEY: <span className="text-yellow-500">{TARGET_LICENSE_KEY}</span>
        </div>
      </div>

      {/* Table Content */}
      {trades.length === 0 ? (
        <div className="text-gray-500 text-center py-12 flex flex-col items-center">
          <div className="text-4xl mb-2">⏳</div>
          <p>Chưa có dữ liệu giao dịch.</p>
          <p className="text-sm text-gray-600 mt-1">Đang chờ Bot khai hỏa lệnh đầu tiên...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">Ticket</th>
                <th className="px-6 py-3">Cặp tiền</th>
                <th className="px-6 py-3">Loại</th>
                <th className="px-6 py-3 text-right">Lợi nhuận</th>
                <th className="px-6 py-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">#{trade.ticket}</td>
                  <td className="px-6 py-4 font-bold text-yellow-500">{trade.symbol}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      trade.type === 'BUY' 
                        ? 'bg-blue-900/30 text-blue-400 border-blue-900' 
                        : 'bg-red-900/30 text-red-400 border-red-900'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-bold text-right text-base ${
                    trade.profit >= 0 ? 'text-green-400' : 'text-red-500'
                  }`}>
                    {trade.profit >= 0 ? '+' : ''}{trade.profit} $
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs text-right font-mono">
                    {trade.createdAt 
                      ? new Date(trade.createdAt.seconds * 1000).toLocaleString('vi-VN') 
                      : '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
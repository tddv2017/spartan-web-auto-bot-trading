"use client";
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldAlert, CheckCircle, XCircle, Calendar, Edit3 } from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy toàn bộ danh sách lính từ Database
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  // Hàm gia hạn thêm 30 ngày
  const renew30Days = async (userId: string, currentExpiry: any) => {
    const userRef = doc(db, "users", userId);
    const now = currentExpiry ? new Date(currentExpiry.seconds * 1000) : new Date();
    const newDate = Timestamp.fromDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
    
    await updateDoc(userRef, { expiryDate: newDate, plan: "VIP" });
    alert("Đã gia hạn 30 ngày VIP!");
    fetchUsers();
  };

  if (!isAdmin) return <div className="text-white p-20 text-center font-bold">🚫 TRUY CẬP BỊ CHẶN. CHỈ DÀNH CHO ADMIN.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-3">
              <Users className="text-green-500" /> QUẢN LÝ BINH ĐOÀN
            </h1>
            <p className="text-slate-500 italic">Tổng số: {users.length} chiến binh đang hoạt động</p>
          </div>
          <button onClick={fetchUsers} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all">LÀM MỚI DANH SÁCH</button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest">
                <th className="p-4">Người dùng</th>
                <th className="p-4">License Key</th>
                <th className="p-4">Số MT5</th>
                <th className="p-4">Hạn dùng</th>
                <th className="p-4">Gói</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{u.email || "User ẩn danh"}</td>
                  <td className="p-4 font-mono text-green-500 text-sm">{u.licenseKey}</td>
                  <td className="p-4 font-mono text-yellow-500">{u.mt5Account || "---"}</td>
                  <td className="p-4 text-sm">
                    {u.expiryDate ? new Date(u.expiryDate.seconds * 1000).toLocaleDateString('vi-VN') : "Vĩnh viễn"}
                  </td>
                  <td className="p-4 text">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.plan === 'VIP' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>
                      {u.plan || "FREE"}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => renew30Days(u.id, u.expiryDate)}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md text-xs font-bold transition-all"
                    >
                      <Calendar size={14} /> +30 NGÀY
                    </button>
                    <button 
                      onClick={async () => {
                        if(confirm("Xác nhận reset MT5?")) {
                          await updateDoc(doc(db, "users", u.id), { mt5Account: "" });
                          fetchUsers();
                        }
                      }}
                      className="flex items-center gap-1 bg-red-900/50 hover:bg-red-900 text-red-400 px-3 py-1 rounded-md text-xs font-bold transition-all"
                    >
                      <Edit3 size={14} /> RESET MT5
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
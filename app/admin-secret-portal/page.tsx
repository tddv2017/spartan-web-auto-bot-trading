"use client";
import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldAlert, Calendar, Crown, Zap, RefreshCw, Trash2, Infinity } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "users"));
    const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  // 🛠️ HÀM CẬP NHẬT TỔNG LỰC (Hỗ trợ cả Thủ công & Cộng dồn)
  const updateUserSoldier = async (userId: string, currentExpiry: any, days: number, plan: string, manualDate?: string) => {
    const userRef = doc(db, "users", userId);
    let newDate;

    if (manualDate) {
      // 1. Nếu chỉnh bằng ô chọn ngày
      newDate = Timestamp.fromDate(new Date(manualDate));
    } else if (days === 99999) {
      // 2. Nếu chọn gói Vĩnh viễn
      newDate = Timestamp.fromDate(new Date("2099-12-31"));
    } else {
      // 3. Nếu cộng dồn ngày (+30, +365)
      const baseDate = (currentExpiry && currentExpiry.seconds * 1000 > Date.now()) 
        ? new Date(currentExpiry.seconds * 1000) 
        : new Date();
      newDate = Timestamp.fromDate(new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000));
    }
    
    await updateDoc(userRef, { expiryDate: newDate, plan: plan });
    alert(`Quân lệnh thực thi: Nâng cấp ${plan.toUpperCase()} thành công!`);
    fetchUsers();
  };

  if (!isAdmin) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-black text-2xl animate-bounce tracking-tighter">
       🚫 KHU VỰC CẤM - CHỈ DÀNH CHO TỔNG TƯ LỆNH
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tighter italic">
              <ShieldAlert className="text-red-600 animate-pulse" size={40} /> TỔNG HÀNH DINH ADMIN
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
              QUẢN LÝ QUÂN SỐ: {users.length} CHIẾN BINH
            </p>
          </div>
          <button onClick={fetchUsers} className="bg-green-600 hover:bg-green-500 text-black px-6 py-3 rounded-xl font-black transition-all flex items-center gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> LÀM MỚI DANH SÁCH
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-700">
                  <th className="p-6">Chiến binh</th>
                  <th className="p-6">License Key</th>
                  <th className="p-6">Số MT5</th>
                  <th className="p-6 text-center">Quân hàm</th>
                  <th className="p-6">Hạn dùng</th>
                  <th className="p-6 text-right">Lệnh thực thi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="font-black text-white">{u.displayName || "Ẩn danh"}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="p-6">
                      <span className="font-mono text-green-500 bg-green-500/5 px-2 py-1 rounded border border-green-500/10 text-xs">{u.licenseKey}</span>
                    </td>
                    <td className="p-6 font-mono font-bold text-amber-500">{u.mt5Account || "---"}</td>
                    <td className="p-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-lg ${
                        u.plan === 'lifetime' ? 'bg-purple-600 text-white' :
                        u.plan === 'yearly' ? 'bg-amber-500 text-black' :
                        u.plan === 'starter' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {u.plan || "FREE"}
                      </span>
                    </td>
                    <td className={`p-6 text-sm font-bold ${(u.expiryDate?.seconds * 1000 < Date.now()) ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
                      {u.expiryDate ? new Date(u.expiryDate.seconds * 1000).toLocaleDateString('vi-VN') : "VĨNH VIỄN"}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col md:flex-row items-center justify-end gap-3">
                        
                        {/* 🗓️ CHỈNH NGÀY THỦ CÔNG */}
                        <input 
                          type="date"
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white outline-none focus:border-green-500"
                          defaultValue={u.expiryDate?.seconds ? new Date(u.expiryDate.seconds * 1000).toISOString().split('T')[0] : ""}
                          onChange={(e) => {
                            if (confirm(`Xác nhận đổi ngày đến: ${e.target.value}?`)) {
                              updateUserSoldier(u.id, null, 0, u.plan || "starter", e.target.value);
                            }
                          }}
                        />

                        <div className="flex gap-1">
                          {/* Nút PRO (+30 ngày) */}
                          <button onClick={() => updateUserSoldier(u.id, u.expiryDate, 30, "starter")} title="+30 Ngày PRO" className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20"><Zap size={14} /></button>
                          
                          {/* Nút VIP (+1 Năm) - GÓI ĐÃ TRỞ LẠI! */}
                          <button onClick={() => updateUserSoldier(u.id, u.expiryDate, 365, "yearly")} title="+1 Năm VIP" className="p-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-all shadow-lg shadow-amber-500/20"><Crown size={14} /></button>
                          
                          {/* Nút LIFETIME */}
                          <button onClick={() => updateUserSoldier(u.id, null, 99999, "lifetime")} title="Nâng lên Vĩnh viễn" className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all shadow-lg shadow-purple-600/20"><Infinity size={14} /></button>

                          {/* RESET MT5 */}
                          <button onClick={async () => { if(confirm("Reset MT5?")) { await updateDoc(doc(db, "users", u.id), { mt5Account: "" }); fetchUsers(); } }} className="p-2 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-all"><RefreshCw size={14} /></button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
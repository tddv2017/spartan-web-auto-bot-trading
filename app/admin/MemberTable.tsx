"use client";
import React from 'react';
import { useRouter } from 'next/navigation'; // 🚀 BẮT BUỘC: Import radar điều hướng
import { 
  Search, Play, Pause, Zap, Crown, Infinity, 
  RefreshCw, Trash2, Fingerprint, Eye 
} from 'lucide-react';

interface MemberTableProps {
  users: any[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterPlan: string;
  setFilterPlan: (val: string) => void;
  onUpdateSoldier: (id: string, expiry: any, days: number, plan: string) => void;
  onToggleStatus: (user: any) => void;
  onResetMT5: (id: string) => void;
  onDeleteUser: (id: string) => void;
  // Bỏ onInspect nếu ngài muốn dùng router trực tiếp ở đây cho đơn giản
}

export const MemberTable = ({
  users, searchTerm, setSearchTerm, filterPlan, setFilterPlan,
  onUpdateSoldier, onToggleStatus, onResetMT5, onDeleteUser
}: MemberTableProps) => {
  const router = useRouter(); // 🚀 BẮT BUỘC: Khởi tạo radar

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 🔍 SEARCH & FILTER */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between bg-black/20">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Tìm Email, Tên, MT5, License..." 
            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-green-500 outline-none transition-all" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <select 
          className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-green-500 cursor-pointer font-bold" 
          value={filterPlan} 
          onChange={(e) => setFilterPlan(e.target.value)}
        >
          <option value="all">Tất cả quân hàm</option>
          <option value="free">FREE TRIAL</option>
          <option value="starter">PRO Daily</option>
          <option value="yearly">VIP Yearly</option>
          <option value="LIFETIME">LIFETIME</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 text-slate-500 text-xs uppercase font-bold border-b border-slate-800">
              <th className="p-4">Binh Sĩ & License</th>
              <th className="p-4">Tài Chính</th>
              <th className="p-4 text-center">Gói Cước</th>
              <th className="p-4">Trạng Thái</th>
              <th className="p-4 text-right">Bảng Lệnh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="p-4">
                  <div className="font-bold text-white mb-0.5">{u.displayName || "N/A"}</div>
                  <div className="text-xs text-slate-500 mb-1">{u.email}</div>
                  <div className="flex flex-col gap-0.5">
                      <div className="text-[10px] text-green-500/70 font-mono">MT5: {u.mt5Account || 'Chưa gắn'}</div>
                      <div className="text-[10px] text-blue-400/70 font-mono flex items-center gap-1">
                          <Fingerprint size={10} className="opacity-50"/> Key: <span className="select-all">{u.licenseKey || 'N/A'}</span>
                      </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs">
                  <div className="flex gap-2">
                    <span className="text-green-400">A:${(u.wallet?.available || 0).toFixed(2)}</span>
                    <span className="text-yellow-500">P:${(u.wallet?.pending || 0).toFixed(2)}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase 
                    ${u.plan === 'LIFETIME' ? 'bg-purple-900/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                    {u.plan || "FREE"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                      {u.remoteCommand === "PAUSE" ? (
                        <span className="text-red-500 font-bold text-[10px] flex items-center gap-1 uppercase"><Pause size={10}/> PAUSED</span>
                      ) : (
                        <span className="text-green-500 font-bold text-[10px] flex items-center gap-1 uppercase"><Play size={10}/> RUNNING</span>
                      )}
                      <div className="text-slate-400 text-[10px] font-mono italic">
                        {u.plan === 'LIFETIME' ? <Infinity size={14} className="text-purple-500"/> : 
                          u.expiryDate ? new Date(u.expiryDate.seconds * 1000).toLocaleDateString('vi-VN') : '---'}
                      </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    
                    {/* 👁️ SOI CHI TIẾT -> Điều hướng trang riêng */}
                    <button 
                      onClick={() => router.push(`/admin/member/${u.id}`)} 
                      className="p-1.5 bg-cyan-600/20 border border-cyan-600/30 text-cyan-500 rounded hover:bg-cyan-600 hover:text-white transition-all" 
                      title="Soi hầm ngầm"
                    >
                      <Eye size={14}/>
                    </button>

                    {/* ⏯️ PAUSE/RUN */}
                    <button onClick={() => onToggleStatus(u)} className={`p-1.5 border rounded transition-all ${u.remoteCommand === "PAUSE" ? "text-green-500 border-green-600/30" : "text-orange-500 border-orange-600/30"}`}>{u.remoteCommand === "PAUSE" ? <Play size={14}/> : <Pause size={14}/>}</button>
                    
                    {/* ⚡ UPGRADE */}
                    <button onClick={() => onUpdateSoldier(u.id, u.expiryDate, 30, "starter")} className="p-1.5 bg-blue-600/10 border border-blue-600/30 rounded text-blue-500"><Zap size={14}/></button>
                    <button onClick={() => onUpdateSoldier(u.id, u.expiryDate, 365, "yearly")} className="p-1.5 bg-amber-600/10 border border-amber-600/30 rounded text-amber-500"><Crown size={14}/></button>
                    <button onClick={() => onUpdateSoldier(u.id, null, 0, "LIFETIME")} className="p-1.5 bg-purple-600/10 border border-purple-600/30 rounded text-purple-500"><Infinity size={14}/></button>
                    
                    {/* ♻️ RESET & DELETE */}
                    <button onClick={() => onResetMT5(u.id)} className="p-1.5 bg-slate-800 border border-slate-700 rounded hover:bg-white hover:text-black transition-all"><RefreshCw size={14}/></button>
                    <button onClick={() => onDeleteUser(u.id)} className="p-1.5 bg-red-900/20 border border-red-500/50 rounded text-red-500 hover:bg-red-500 transition-all"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
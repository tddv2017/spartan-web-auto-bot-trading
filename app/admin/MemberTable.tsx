"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Play, Pause, Zap, Crown, Infinity, 
  RefreshCw, Trash2, Fingerprint, Eye, Target, Hash
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
}

export const MemberTable = ({
  users, searchTerm, setSearchTerm, filterPlan, setFilterPlan,
  onUpdateSoldier, onToggleStatus, onResetMT5, onDeleteUser
}: MemberTableProps) => {
  const router = useRouter(); 

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111827] shadow-sm overflow-hidden">
      
      {/* 🔍 SEARCH & FILTER BAR */}
      <div className="border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row gap-4 justify-between bg-slate-900/30">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Tìm Email, Tên, MT5, License..." 
            className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-2.5 pl-11 pr-4 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <select 
          className="rounded-xl border border-slate-700 bg-[#0B1120] py-2.5 px-4 text-sm font-semibold text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none min-w-[160px]" 
          value={filterPlan} 
          onChange={(e) => setFilterPlan(e.target.value)}
        >
          <option value="all">Tất cả Quân Hàm</option>
          <option value="free">FREE TRIAL</option>
          <option value="starter">PRO DAILY</option>
          <option value="yearly">VIP YEARLY</option>
          <option value="LIFETIME">LIFETIME</option>
        </select>
      </div>

      {/* 📊 DATA TABLE */}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#0B1120] text-left border-b border-slate-800">
              <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chiến Binh</th>
              <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tài Chính</th>
              <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Gói Cước</th>
              <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng Thái (Bot)</th>
              <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Tác Vụ Quản Trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.length === 0 ? (
                <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500 font-medium italic">Không tìm thấy dữ liệu binh sĩ.</td>
                </tr>
            ) : users.map((u, index) => (
              <tr key={u.id} className={`transition-colors hover:bg-slate-800/30 ${index % 2 === 0 ? 'bg-[#111827]' : 'bg-[#0f1523]'}`}>
                
                {/* User Info */}
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                      <span className="font-bold text-white text-sm tracking-tight">{u.displayName || "Unknown Soldier"}</span>
                      <span className="text-xs text-slate-500 mb-2">{u.email}</span>
                      <div className="flex flex-col gap-1 mt-1">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded w-fit">
                              <Target size={10} className="text-green-500"/> MT5: <span className="text-white">{u.mt5Account || 'Chưa gắn'}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded w-fit">
                              <Fingerprint size={10} className="text-blue-500"/> KEY: <span className="text-white select-all">{u.licenseKey || 'N/A'}</span>
                          </span>
                      </div>
                  </div>
                </td>

                {/* Finance */}
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5 font-mono text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px] uppercase w-4">Av:</span>
                        <span className="text-emerald-400 font-bold">${Number(u.wallet?.available || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px] uppercase w-4">Pd:</span>
                        <span className="text-yellow-500 font-bold">${Number(u.wallet?.pending || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </td>

                {/* Plan Badge */}
                <td className="py-4 px-6 text-center">
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold uppercase border 
                    ${u.plan === 'LIFETIME' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                      u.plan === 'yearly' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-800/50 text-slate-400 border-slate-700'}`}>
                    {u.plan || "FREE"}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5">
                      {u.remoteCommand === "PAUSE" ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase"><span className="h-1.5 w-1.5 rounded-full bg-red-400"></span> PAUSED</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> RUNNING</span>
                      )}
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        Exp: {u.plan === 'LIFETIME' ? <Infinity size={12} className="text-purple-400"/> : 
                          <span className="font-mono">{u.expiryDate ? new Date(u.expiryDate.seconds * 1000).toLocaleDateString('vi-VN') : '---'}</span>}
                      </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2">
                    
                    {/* View Details */}
                    <button 
                      onClick={() => router.push(`/admin/member/${u.id}`)} 
                      className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20" 
                      title="Xem hồ sơ chi tiết"
                    >
                      <Eye size={16}/>
                    </button>
                    
                    {/* Toggle Status */}
                    <button 
                      onClick={() => onToggleStatus(u)} 
                      className={`p-1.5 rounded-lg transition-colors border border-transparent 
                        ${u.remoteCommand === "PAUSE" ? "text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20" : "text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/20"}`}
                      title={u.remoteCommand === "PAUSE" ? "Mở Bot" : "Dừng Bot"}
                    >
                        {u.remoteCommand === "PAUSE" ? <Play size={16}/> : <Pause size={16}/>}
                    </button>

                    <div className="w-px h-6 bg-slate-700 mx-1 self-center"></div>
                    
                    {/* Upgrades */}
                    <button onClick={() => onUpdateSoldier(u.id, u.expiryDate, 30, "starter")} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Gia hạn PRO 30 ngày"><Zap size={14}/></button>
                    <button onClick={() => onUpdateSoldier(u.id, u.expiryDate, 365, "yearly")} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Gia hạn VIP 1 năm"><Crown size={14}/></button>
                    <button onClick={() => onUpdateSoldier(u.id, null, 0, "LIFETIME")} className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors" title="Set LIFETIME"><Infinity size={14}/></button>
                    
                    <div className="w-px h-6 bg-slate-700 mx-1 self-center"></div>

                    {/* Dangers */}
                    <button onClick={() => onResetMT5(u.id)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Gỡ MT5 ID"><RefreshCw size={14}/></button>
                    <button onClick={() => onDeleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="XÓA LÍNH"><Trash2 size={14}/></button>
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
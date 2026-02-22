"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  doc, getDoc, updateDoc, collection, 
  query, orderBy, limit, onSnapshot, deleteDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
  ArrowLeft, Bot, History, Plus, Trash2, Database, 
  Save, Wallet, Calendar, ShieldCheck, Fingerprint, 
  Edit3, X, Zap, Target, Activity, Loader2, Hash, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function SpartanTailAdminPro() {
  const { id } = useParams();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newTrade, setNewTrade] = useState({ 
    symbol: 'XAUUSD', 
    type: 'BUY', 
    profit: 0, 
    ticket: 0 
  });

  // 1. AUTHENTICATION
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. FETCH USER PROFILE
  useEffect(() => {
    if (!currentUser || !id) return;
    const docRef = doc(db, "users", String(id));
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUser({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser, id]);

  // 3. FETCH TRADES
  useEffect(() => {
    if (!currentUser || !user?.mt5Account) return;
    const tradesRef = collection(db, "bots", String(user.mt5Account), "trades");
    const q = query(tradesRef, orderBy("time", "desc"), limit(50));
    
    const unsub = onSnapshot(q, (snap) => {
      setTrades(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser, user?.mt5Account]);

  // --- CRUD OPERATIONS ---
  const handleUpdateUser = async () => {
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", String(id));
      await updateDoc(userRef, {
        displayName: user.displayName,
        mt5Account: user.mt5Account,
        licenseKey: user.licenseKey,
        plan: user.plan,
        "wallet.available": parseFloat(user.wallet?.available || 0),
        intelMessage: user.intelMessage || "",
      });
      setEditMode(false);
    } catch (e: any) {
      alert("⚠️ LỖI CẬP NHẬT: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTrade = async () => {
    if (!user?.mt5Account) return;
    setIsSaving(true);
    try {
      const tradesRef = collection(db, "bots", String(user.mt5Account), "trades");
      const ticketNum = Math.floor(Math.random() * 900000) + 100000;
      await addDoc(tradesRef, { 
        ...newTrade, 
        ticket: ticketNum,
        time: new Date().toISOString(), 
        timestamp: serverTimestamp(),
        mt5Account: Number(user.mt5Account) 
      });
      setShowAddForm(false);
      setNewTrade({ symbol: 'XAUUSD', type: 'BUY', profit: 0, ticket: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (!confirm("🚨 XÁC NHẬN TIÊU HỦY LỆNH NÀY?")) return;
    try {
      await deleteDoc(doc(db, "bots", String(user.mt5Account), "trades", tradeId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Đang đồng bộ dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans p-4 md:p-8 lg:p-10 selection:bg-blue-500/30 relative">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* ================= HEADER & BREADCRUMB ================= */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-slate-800/50 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 hover:text-white text-slate-400 rounded-lg transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Hồ Sơ Cán Bộ</h2>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.back()}>Dashboard</span>
                <ChevronRight size={12} />
                <span className="text-blue-400">{user?.displayName}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Trực tuyến</span>
          </div>
        </div>

        {/* ================= OVERVIEW CARDS ================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Tài khoản MT5', value: user.mt5Account || 'CHƯA GẮN', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Số dư hiện tại', value: `$${Number(user.wallet?.available || 0).toFixed(2)}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Cấp bậc (Plan)', value: user.plan || 'FREE', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { label: 'Mã giấy phép', value: user.licenseKey || 'N/A', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          ].map((stat, index) => (
            <div key={index} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:border-slate-700 transition-colors">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${stat.bg} ${stat.border} border`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <h4 className="text-2xl font-bold text-white mt-0.5 tracking-tight">{stat.value}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          
          {/* LEFT COL: PROFILE IDENTITY */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827] shadow-sm flex flex-col">
            <div className="border-b border-slate-800 px-6 py-5 flex justify-between items-center bg-slate-900/20 rounded-t-2xl">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Định Danh Hệ Thống</h3>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="text-blue-500 hover:text-blue-400 text-sm font-semibold flex items-center gap-1.5 transition-colors">
                  <Edit3 size={16}/> Sửa
                </button>
              )}
            </div>
            
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                <div className="h-28 w-28 rounded-full bg-[#1e293b] border-4 border-[#0B1120] shadow-xl flex items-center justify-center relative z-10">
                  <Bot size={48} className="text-blue-400" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white tracking-tight">{user.displayName}</h3>
              <p className="text-sm text-slate-400 mt-1 mb-8">{user.email}</p>
              
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B1120] border border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-2"><Fingerprint size={16} className="text-slate-400"/> ID NGƯỜI DÙNG</span>
                  <span className="text-sm font-bold text-slate-300 font-mono">{user.id}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B1120] border border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-2"><Calendar size={16} className="text-slate-400"/> NGÀY GIA NHẬP</span>
                  <span className="text-sm font-bold text-slate-300">{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL: CONFIGURATION FORM */}
          <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-[#111827] shadow-sm">
            <div className="border-b border-slate-800 px-6 py-5 flex justify-between items-center bg-slate-900/20 rounded-t-2xl">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Tham Số Chiến Thuật</h3>
              {editMode && (
                <div className="flex gap-3">
                  <button onClick={() => setEditMode(false)} className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">HỦY TÁC VỤ</button>
                  <button onClick={handleUpdateUser} disabled={isSaving} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70">
                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>} LƯU CẬP NHẬT
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Form Inputs */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tên Hiển Thị</label>
                  <input 
                    type="text" 
                    disabled={!editMode}
                    value={user.displayName}
                    onChange={e => setUser({...user, displayName: e.target.value})}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-3.5 px-4 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 disabled:border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số MT5 Điều Khiển</label>
                  <input 
                    type="text" 
                    disabled={!editMode}
                    value={user.mt5Account}
                    onChange={e => setUser({...user, mt5Account: e.target.value})}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-3.5 px-4 text-sm text-white font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 disabled:border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cấp Bậc Gói (Plan)</label>
                  <select 
                    disabled={!editMode}
                    value={user.plan}
                    onChange={e => setUser({...user, plan: e.target.value})}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-3.5 px-4 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all disabled:opacity-60 disabled:border-slate-800 cursor-pointer appearance-none"
                  >
                    <option value="free">FREE TRIAL</option>
                    <option value="starter">PRO DAILY</option>
                    <option value="yearly">VIP YEARLY</option>
                    <option value="LIFETIME">LIFETIME</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số dư hệ thống ($)</label>
                  <input 
                    type="number" 
                    disabled={!editMode}
                    value={user.wallet?.available}
                    onChange={e => setUser({...user, wallet: {...user.wallet, available: e.target.value}})}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-3.5 px-4 text-sm text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60 disabled:border-slate-800"
                  />
                </div>

                <div className="md:col-span-2 space-y-2 pt-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Activity size={14} className="text-yellow-500"/> Mệnh Lệnh Từ Sở Chỉ Huy (Intel)
                  </label>
                  <textarea 
                    rows={3}
                    disabled={!editMode}
                    value={user.intelMessage}
                    onChange={e => setUser({...user, intelMessage: e.target.value})}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-4 px-5 text-sm text-yellow-500 italic focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all disabled:opacity-60 disabled:border-slate-800 resize-none leading-relaxed"
                    placeholder="Nhập thông điệp truyền xuống Dashboard của binh sĩ..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DATA TABLE: TACTICAL LOGS ================= */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] shadow-sm overflow-hidden mt-8">
          
          {/* Table Header Action */}
          <div className="border-b border-slate-800 px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2.5">
                <Database size={20} className="text-blue-500"/> NHẬT KÝ GIAO DỊCH
              </h3>
              <p className="text-xs text-slate-400 mt-1">Dữ liệu được đồng bộ trực tiếp từ trạm thu phát vệ tinh</p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm ${showAddForm ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-black hover:bg-slate-200 shadow-white/10'}`}
            >
              {showAddForm ? <X size={16}/> : <Plus size={16}/>}
              {showAddForm ? 'ĐÓNG FORM' : 'GHI NHẬN THỦ CÔNG'}
            </button>
          </div>

          {/* Form Thêm Lệnh Inline */}
          {showAddForm && (
            <div className="p-6 border-b border-slate-800 bg-[#0B1120]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tài Sản (Symbol)</label>
                  <input type="text" className="w-full rounded-lg border border-slate-700 bg-[#111827] py-2.5 px-4 text-sm text-white uppercase font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" value={newTrade.symbol} onChange={e => setNewTrade({...newTrade, symbol: e.target.value})} placeholder="XAUUSD"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lợi Nhuận ($)</label>
                  <input type="number" className="w-full rounded-lg border border-slate-700 bg-[#111827] py-2.5 px-4 text-sm text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" value={newTrade.profit} onChange={e => setNewTrade({...newTrade, profit: Number(e.target.value)})} placeholder="0.00"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Loại Lệnh</label>
                  <select className="w-full rounded-lg border border-slate-700 bg-[#111827] py-2.5 px-4 text-sm text-white font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" value={newTrade.type} onChange={e => setNewTrade({...newTrade, type: e.target.value})}>
                    <option value="BUY">BUY (LONG)</option>
                    <option value="SELL">SELL (SHORT)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={handleAddTrade} disabled={isSaving} className="w-full rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-bold text-white hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70">
                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} XÁC NHẬN GHI
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Premium Data Table */}
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-[#0B1120] text-left border-b border-slate-800">
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cặp Giao Dịch</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Profit</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng Thái Lệnh</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mã Lệnh / Thời gian</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Tác Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-slate-500 font-medium">
                      <div className="flex flex-col items-center gap-3">
                        <History size={32} className="text-slate-700" />
                        Chưa có lịch sử giao dịch nào được ghi nhận
                      </div>
                    </td>
                  </tr>
                ) : (
                  trades.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-slate-800/30">
                      {/* Asset */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${t.profit >= 0 ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                          <span className="font-bold text-white uppercase text-sm tracking-tight">{t.symbol}</span>
                        </div>
                      </td>
                      
                      {/* Profit */}
                      <td className="py-4 px-6">
                        <span className={`font-mono text-base font-bold ${t.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {t.profit > 0 ? '+' : ''}{Number(t.profit).toFixed(2)}$
                        </span>
                      </td>

                      {/* Action Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase border ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${t.type === 'BUY' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          {t.type}
                        </span>
                      </td>

                      {/* Info */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5"><Hash size={12} className="text-slate-500"/> {t.ticket}</span>
                          <span className="text-[11px] text-slate-500">{t.time ? new Date(t.time).toLocaleString('vi-VN') : 'N/A'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDeleteTrade(t.id)} 
                          className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors inline-flex justify-center" 
                          title="Tiêu hủy lệnh"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
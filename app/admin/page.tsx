"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, query, where, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Crown, Zap, RefreshCw, Infinity, Search, Wallet, 
  CheckCircle, XCircle, CreditCard, Bitcoin, UserPlus, Clock, 
  LayoutDashboard, Users, Banknote, Activity, Server, Radio,
  Trash2 
} from 'lucide-react';

// --- COMPONENTS HỖ TRỢ ---
const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
  <div className={`bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-${color}-500/50 transition-all`}>
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-500`}>
       <Icon size={60} />
    </div>
    <div className="relative z-10">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">{label}</p>
        <h3 className={`text-3xl font-black font-mono text-white`}>{value}</h3>
        {subValue && <p className={`text-xs mt-1 font-bold text-${color}-500`}>{subValue}</p>}
    </div>
  </div>
);

const AdminTabButton = ({ active, onClick, icon: Icon, label, alertCount }: any) => (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-3 px-6 py-4 transition-all duration-300 border-b-2
        ${active ? 'border-green-500 bg-green-500/10 text-white' : 'border-transparent text-slate-500 hover:text-green-400 hover:bg-white/5'}`}
    >
      <Icon size={18} className={active ? "text-green-500" : ""} />
      <span className="font-bold uppercase tracking-widest text-sm">{label}</span>
      {alertCount > 0 && (
          <span className="ml-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{alertCount}</span>
      )}
    </button>
);

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'finance'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  const pendingUsers = useMemo(() => users.filter(u => u.accountStatus === 'pending'), [users]);
  const withdrawRequests = useMemo(() => users.filter(u => u.wallet?.pending > 0), [users]);
  const activeUsers = useMemo(() => users.filter(u => u.accountStatus === 'active' && u.mt5Account), [users]);
  const totalPendingWithdraw = useMemo(() => withdrawRequests.reduce((acc, curr) => acc + (curr.wallet?.pending || 0), 0), [withdrawRequests]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      userList.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) { console.error("Lỗi tải danh sách:", error); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchUsers(); }, [isAdmin]);

  useEffect(() => {
    let result = users;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.email?.toLowerCase().includes(lowerTerm)) || 
        (u.licenseKey?.toLowerCase().includes(lowerTerm)) ||
        (u.displayName?.toLowerCase().includes(lowerTerm)) ||
        (u.mt5Account?.toString().includes(lowerTerm))
      );
    }
    if (filterPlan !== "all") {
      result = result.filter(u => (u.plan || "free") === filterPlan);
    }
    if (activeTab === 'members') {
        result = result.filter(u => u.accountStatus !== 'pending' && u.accountStatus !== 'rejected');
    }   
    setFilteredUsers(result);
  }, [searchTerm, filterPlan, users, activeTab]);

  // --- ACTIONS ---

  // 🔥 HÀM NÂNG CẤP GÓI MANUAL + TỰ ĐỘNG CHIA HOA HỒNG (GIỮ NGUYÊN UI)
  const updateUserSoldier = async (userId: string, currentExpiry: any, days: number, plan: string) => {
    if(!confirm(`Xác nhận nâng cấp gói ${plan.toUpperCase()}?`)) return;
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
        const userData = userSnap.data();

        // 1. Tính toán ngày hết hạn mới
        let newDate;
        if (plan === 'LIFETIME') newDate = Timestamp.fromDate(new Date("2099-12-31T23:59:59"));
        else {
            const now = Date.now();
            const expiryMillis = currentExpiry ? currentExpiry.seconds * 1000 : 0;
            const baseDate = (expiryMillis > now) ? new Date(expiryMillis) : new Date();
            baseDate.setDate(baseDate.getDate() + days);
            newDate = Timestamp.fromDate(baseDate);
        }

        // 2. Cập nhật gói cho User
        await updateDoc(userRef, { expiryDate: newDate, plan: plan, accountStatus: 'active' });

        // 3. 🚀 TRUY KÍCH HOA HỒNG CHO ĐẠI LÝ (REFERRER)
        const referrerKey = userData.referredBy;
        if (referrerKey) {
            const planPrices: { [key: string]: number } = { "starter": 30, "yearly": 299, "LIFETIME": 999 };
            const commissionAmount = Number(((planPrices[plan] || 0) * 0.4).toFixed(2)); // Hoa hồng 40%

            if (commissionAmount > 0) {
                const q = query(collection(db, "users"), where("licenseKey", "==", referrerKey));
                const refSnapshot = await getDocs(q);

                if (!refSnapshot.empty) {
                    const referrerDoc = refSnapshot.docs[0];
                    const referrerData = referrerDoc.data();

                    await updateDoc(referrerDoc.ref, {
                        "wallet.available": Number(((referrerData.wallet?.available || 0) + commissionAmount).toFixed(2)),
                        referrals: (referrerData.referrals || []).map((ref: any) => {
                            // Cập nhật trạng thái Active và số tiền hoa hồng trong lịch sử của Sếp
                            if (ref.uid === userId || ref.email === userData.email) {
                                return { 
                                    ...ref, 
                                    status: 'approved', 
                                    plan: plan, 
                                    commission: commissionAmount, 
                                    updatedAt: new Date().toISOString() 
                                };
                            }
                            return ref;
                        })
                    });
                }
            }
        }
        
        fetchUsers();
        alert("✅ Nâng cấp & Giải ngân hoa hồng thành công!");
    } catch (e) { alert("Lỗi: " + e); }
  };

  const handleApproveUser = async (user: any) => {
     if(!confirm(`DUYỆT TÂN BINH: ${user.email}?`)) return;
     try {
         await updateDoc(doc(db, "users", user.id), {
            accountStatus: 'active', plan: 'free', 
            expiryDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), 
            approvedAt: new Date().toISOString()
         });
         fetchUsers();
         alert("✅ Đã duyệt thành công!");
     } catch (e) { alert("Lỗi: " + e); }
  };

  const handleRejectUser = async (user: any) => {
     if(!confirm("TỪ CHỐI TÂN BINH NÀY?")) return;
     try {
         await updateDoc(doc(db, "users", user.id), { accountStatus: 'rejected', rejectedAt: new Date().toISOString() });
         fetchUsers();
     } catch (e) { alert("Lỗi: " + e); }
  };

  const handleDeleteUser = async (userId: string) => {
      if(!confirm("⚠️ XÓA VĨNH VIỄN User khỏi Database?")) return;
      try { await deleteDoc(doc(db, "users", userId)); fetchUsers(); } catch (e) { alert(e); }
  };

  const approveWithdraw = async (user: any) => {
    const amount = user.wallet.pending;
    if(!confirm(`XÁC NHẬN ĐÃ CHUYỂN $${amount}?`)) return;
    try {
        const newWallet = { ...user.wallet, pending: 0, total_paid: Number((user.wallet.total_paid + amount).toFixed(2)) };
        await updateDoc(doc(db, "users", user.id), { wallet: newWallet });
        fetchUsers();
    } catch (e) { alert(e); }
  };

  const resetMT5 = async (userId: string) => {
    if(!confirm("Reset MT5 ID?")) return;
    await updateDoc(doc(db, "users", userId), { mt5Account: "" });
    fetchUsers();
  };

  const renderPaymentInfo = (user: any) => {
      if (user.cryptoInfo?.walletAddress) return (
          <div className="bg-black/40 p-3 rounded border border-slate-700 mt-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-yellow-500 mb-1"><Bitcoin size={12}/> {user.cryptoInfo.network}</div>
              <div className="break-all select-all text-white">{user.cryptoInfo.walletAddress}</div>
          </div>
      );
      if (user.bankInfo?.accountNumber) return (
          <div className="bg-black/40 p-3 rounded border border-slate-700 mt-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-blue-400 mb-1"><CreditCard size={12}/> {user.bankInfo.bankName}</div>
              <div className="text-lg font-bold text-white select-all">{user.bankInfo.accountNumber}</div>
              <div className="text-slate-400 uppercase">{user.bankInfo.accountHolder}</div>
          </div>
      );
      return <div className="text-xs text-red-500 mt-2 italic">Chưa cài đặt thông tin nhận tiền</div>;
  };

  if (!isAdmin) return <div className="min-h-screen bg-[#050b14] flex items-center justify-center text-red-500 font-black animate-pulse">:: ACCESS DENIED ::</div>;

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans selection:bg-green-500/30 pb-20 relative">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <header className="border-b border-white/10 bg-[#050b14]/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <ShieldAlert className="text-red-500 animate-pulse" size={32} />
                  <div>
                      <h1 className="text-xl font-black italic tracking-tighter leading-none">SPARTAN <span className="text-green-500">ADMIN</span></h1>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Supreme Command Center</p>
                  </div>
              </div>
              <button onClick={fetchUsers} className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
          </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-6 relative z-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top duration-500">
            <StatCard label="Total Users" value={users.length} icon={Users} color="blue" subValue={`${activeUsers.length} Active MT5`} />
            <StatCard label="Pending Approval" value={pendingUsers.length} icon={UserPlus} color="red" subValue={pendingUsers.length > 0 ? "Requires Action" : "All Clear"} />
            <StatCard label="Pending Payout" value={`$${totalPendingWithdraw.toFixed(2)}`} icon={Wallet} color="yellow" subValue={`${withdrawRequests.length} Requests`} />
            <StatCard label="Server Status" value="100%" icon={Server} color="green" subValue="Latency: 24ms" />
        </div>

        <div className="flex flex-col md:flex-row border-b border-white/10 bg-black/20 backdrop-blur rounded-t-xl overflow-hidden">
            <AdminTabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Dashboard" alertCount={pendingUsers.length} />
            <AdminTabButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={Users} label="Members List" alertCount={0} />
            <AdminTabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={Banknote} label="Finance" alertCount={withdrawRequests.length} />
        </div>

        <div className="min-h-[500px] animate-in fade-in duration-500">
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-200"><UserPlus className="text-red-500"/> NEW RECRUITS ({pendingUsers.length})</h3>
                        {pendingUsers.length === 0 ? <div className="text-center py-10 text-slate-600 italic">No pending applications</div> : (
                            <div className="space-y-3">
                                {pendingUsers.map(u => (
                                    <div key={u.id} className="bg-black/40 border-l-2 border-red-500 p-4 rounded flex justify-between items-center group">
                                        <div><p className="font-bold text-white">{u.displayName}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApproveUser(u)} className="p-2 bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white rounded transition-all"><CheckCircle size={18}/></button>
                                            <button onClick={() => handleRejectUser(u)} className="p-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded transition-all"><XCircle size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-200"><Activity className="text-blue-500"/> LIVE ACTIVITY</h3>
                        <div className="space-y-4">
                            {[1,2,3].map((_,i) => (<div key={i} className="flex gap-3 items-start opacity-50"><div className="mt-1 h-2 w-2 rounded-full bg-slate-500"></div><div><p className="text-xs text-slate-300">Node Spartan-0{i} operational. Heartbeat 100%.</p></div></div>))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'finance' && (
                <div className="space-y-6">
                    <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-black text-yellow-500 uppercase mb-6 flex items-center gap-2"><Wallet/> Withdrawal Requests</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {withdrawRequests.map(req => (
                                <div key={req.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div><p className="font-bold text-white">{req.displayName}</p><p className="text-xs text-slate-500">{req.email}</p></div>
                                        <div className="text-right"><p className="text-2xl font-black text-green-400 font-mono">${req.wallet.pending}</p></div>
                                    </div>
                                    {renderPaymentInfo(req)}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                                        <button onClick={() => approveWithdraw(req)} className="flex-1 py-2 text-xs font-bold text-black bg-green-500 hover:bg-green-400 rounded">PAID</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'members' && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between bg-black/20">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input type="text" placeholder="Search Soldier..." className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-green-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
                            <option value="all">All Plans</option>
                            <option value="starter">PRO Daily</option>
                            <option value="yearly">VIP Yearly</option>
                            <option value="LIFETIME">Lifetime</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/40 text-slate-500 text-xs uppercase font-bold border-b border-slate-800">
                                    <th className="p-4">Soldier</th>
                                    <th className="p-4">Wallet Info</th>
                                    <th className="p-4 text-center">Rank</th>
                                    <th className="p-4">Expiry</th>
                                    <th className="p-4 text-right">Command</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-800/30">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{u.displayName}</div>
                                            <div className="text-xs text-slate-500">{u.email}</div>
                                            <div className="text-[10px] text-green-500/70 font-mono">{u.licenseKey}</div>
                                        </td>
                                        <td className="p-4 font-mono text-xs">
                                            <div className="flex gap-2"><span className="text-green-400">A:${(u.wallet?.available || 0).toFixed(2)}</span><span className="text-yellow-500">P:${(u.wallet?.pending || 0).toFixed(2)}</span></div>
                                            <div className="text-slate-600">Paid: ${(u.wallet?.total_paid || 0).toFixed(2)}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${u.plan === 'LIFETIME' ? 'bg-purple-900/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>{u.plan || "FREE"}</span>
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            {u.plan === 'LIFETIME' ? <Infinity size={16} className="text-purple-500"/> : u.expiryDate ? new Date(u.expiryDate.seconds * 1000).toLocaleDateString('vi-VN') : '---'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => updateUserSoldier(u.id, u.expiryDate, 30, "starter")} className="p-1.5 bg-blue-600/10 border border-blue-600/30 rounded hover:bg-blue-600 text-blue-500 hover:text-white" title="Extend PRO"><Zap size={14}/></button>
                                                <button onClick={() => updateUserSoldier(u.id, u.expiryDate, 365, "yearly")} className="p-1.5 bg-amber-600/10 border border-amber-600/30 rounded hover:bg-amber-600 text-amber-500 hover:text-white" title="Extend VIP"><Crown size={14}/></button>
                                                <button onClick={() => updateUserSoldier(u.id, null, 0, "LIFETIME")} className="p-1.5 bg-purple-600/10 border border-purple-600/30 rounded hover:bg-purple-600 text-purple-500 hover:text-white" title="Set LIFETIME"><Infinity size={14}/></button>
                                                <button onClick={() => resetMT5(u.id)} className="p-1.5 bg-slate-800 border border-slate-700 rounded hover:bg-white hover:text-black transition-all" title="Reset MT5"><RefreshCw size={14}/></button>
                                                <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 bg-red-900/20 border border-red-500/50 rounded hover:bg-red-500 text-red-500 hover:text-black transition-all ml-1" title="DELETE"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
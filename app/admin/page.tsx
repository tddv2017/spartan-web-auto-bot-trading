"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // 🚀 Radar điều hướng trang
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';
import { 
  ShieldAlert, RefreshCw, Wallet, UserPlus, 
  LayoutDashboard, Users, Banknote, Server, Activity,
  CheckCircle, XCircle 
} from 'lucide-react';

// Import các đơn vị tác chiến
import { StatCard, AdminTabButton } from '@/app/admin/SharedComponents';
import { EmergencyPanel } from '@/app/admin/EmergencyPanel';
import { AdminWithdrawCard } from '@/app/admin/AdminWithdrawCard';
import { MemberTable } from '@/app/admin/MemberTable';

export default function AdminPage() {
  const { isAdmin, user: adminUser } = useAuth(); 
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'finance'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  // 📊 TÌNH BÁO: Phân loại quân số Real-time
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
    } catch (error) { console.error("⚠️ Lỗi Radar:", error); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchUsers(); }, [isAdmin]);

  // 🔍 RADAR: Bộ lọc tìm kiếm & Gói cước (Tối ưu quét cả License Key)
  useEffect(() => {
    let result = users;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.email?.toLowerCase().includes(lower) || 
        u.displayName?.toLowerCase().includes(lower) ||
        u.mt5Account?.toString().includes(lower) ||
        u.licenseKey?.toLowerCase().includes(lower)
      );
    }
    if (filterPlan !== "all") result = result.filter(u => (u.plan || "free") === filterPlan);
    if (activeTab === 'members') result = result.filter(u => u.accountStatus !== 'pending' && u.accountStatus !== 'rejected');
    setFilteredUsers(result);
  }, [searchTerm, filterPlan, users, activeTab]);

  // =====================================================================
  // ⚔️ NHIỆM VỤ: CÁC QUÂN LỆNH TÁC CHIẾN (ACTIONS) - GIỮ NGUYÊN & TỐI ƯU
  // =====================================================================
  
  const updateUserSoldier = async (userId: string, currentExpiry: any, days: number, plan: string) => {
    if(!confirm(`Xác nhận nâng cấp gói ${plan.toUpperCase()}?`)) return;
    let newDateStr;
    if (plan === 'LIFETIME') newDateStr = "2099-12-31T23:59:59.000Z";
    else {
        const expiryMillis = currentExpiry ? currentExpiry.seconds * 1000 : Date.now();
        const baseDate = (expiryMillis > Date.now()) ? new Date(expiryMillis) : new Date();
        baseDate.setDate(baseDate.getDate() + days);
        newDateStr = baseDate.toISOString();
    }
    try {
        const token = await adminUser.getIdToken(); 
        await fetch('/api/admin/update-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userId, newExpiryDate: newDateStr, newPlan: plan, daysAdded: days })
        });
        fetchUsers();
    } catch (e) { alert("❌ Lỗi Server!"); }
  };

  const toggleUserStatus = async (user: any) => {
      const isPaused = user.remoteCommand === "PAUSE";
      const newCommand = isPaused ? "RUN" : "PAUSE";
      if(!confirm(`Xác nhận chuyển trạng thái thành: ${newCommand}?`)) return;
      try {
          await updateDoc(doc(db, "users", user.id), {
              remoteCommand: newCommand,
              intelMessage: isPaused ? "MARKET STABLE" : "⚠️ ADMIN PAUSED YOUR BOT",
              lastAdminAction: new Date().toISOString()
          });
          fetchUsers();
      } catch (e) { alert("❌ Lỗi!"); }
  };

  const handleApproveUser = async (user: any) => {
     if(!confirm(`DUYỆT TÂN BINH: ${user.email}?`)) return;
     try {
         await updateDoc(doc(db, "users", user.id), {
            accountStatus: 'active', plan: 'free', 
            expiryDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), 
            remoteCommand: "RUN",
            intelMessage: "MARKET STABLE"
         });
         fetchUsers();
     } catch (e) { alert(e); }
  };

  const handleRejectUser = async (user: any) => {
     if(!confirm("TỪ CHỐI TÂN BINH NÀY?")) return;
     try { await updateDoc(doc(db, "users", user.id), { accountStatus: 'rejected' }); fetchUsers(); } catch (e) { alert(e); }
  };

  const handleDeleteUser = async (userId: string) => {
      if(!confirm("⚠️ XÓA VĨNH VIỄN User?")) return;
      try { await deleteDoc(doc(db, "users", userId)); fetchUsers(); } catch (e) { alert(e); }
  };

  const resetMT5 = async (userId: string) => {
    if(!confirm("Reset MT5 ID?")) return;
    await updateDoc(doc(db, "users", userId), { mt5Account: "" });
    fetchUsers();
  };

  if (!isAdmin) return <div className="min-h-screen bg-[#050b14] flex items-center justify-center text-red-500 font-black animate-pulse">:: ACCESS DENIED ::</div>;

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans pb-20 relative">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* HEADER */}
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
        
        {/* PANEL ĐIỀU KHIỂN KHẨN CẤP */}
        <EmergencyPanel onRefresh={fetchUsers} adminUser={adminUser} />

        {/* THẺ THỐNG KÊ NHANH */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={users.length} icon={Users} color="blue" subValue={`${activeUsers.length} Active MT5`} />
            <StatCard label="Pending Approval" value={pendingUsers.length} icon={UserPlus} color="red" subValue={pendingUsers.length > 0 ? "Requires Action" : "All Clear"} />
            <StatCard label="Pending Payout" value={`$${totalPendingWithdraw.toFixed(2)}`} icon={Wallet} color="yellow" subValue={`${withdrawRequests.length} Requests`} />
            <StatCard label="Server Status" value="100%" icon={Server} color="green" subValue="Latency: 24ms" />
        </div>

        {/* HỆ THỐNG TAB TÁC CHIẾN */}
        <div className="flex flex-col md:flex-row border-b border-white/10 bg-black/20 backdrop-blur rounded-t-xl overflow-hidden">
            <AdminTabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Dashboard" alertCount={pendingUsers.length} />
            <AdminTabButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={Users} label="Members List" alertCount={0} />
            <AdminTabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={Banknote} label="Finance" alertCount={withdrawRequests.length} />
        </div>

        <div className="min-h-[500px] animate-in fade-in duration-500">
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* KHỐI DUYỆT TÂN BINH (DASHBOARD) */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-200"><UserPlus className="text-red-500"/> NEW RECRUITS ({pendingUsers.length})</h3>
                        {pendingUsers.length === 0 ? <div className="text-center py-10 text-slate-600 italic">No pending applications</div> : (
                            <div className="space-y-3">
                                {pendingUsers.map(u => (
                                    <div key={u.id} className="bg-black/40 border-l-2 border-red-500 p-4 rounded flex justify-between items-center group">
                                        <div><p className="font-bold text-white text-sm">{u.displayName}</p><p className="text-[10px] text-slate-500">{u.email}</p></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApproveUser(u)} className="p-2 bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white rounded transition-all"><CheckCircle size={18}/></button>
                                            <button onClick={() => handleRejectUser(u)} className="p-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded transition-all"><XCircle size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* LIVE ACTIVITY SECTION */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-200"><Activity className="text-blue-500"/> LIVE ACTIVITY</h3>
                        <div className="space-y-4">
                            {[1,2,3].map((_,i) => (<div key={i} className="flex gap-3 items-start opacity-50"><div className="mt-1 h-2 w-2 rounded-full bg-slate-500"></div><div><p className="text-xs text-slate-300">Node Spartan-0{i} operational. Heartbeat 100%.</p></div></div>))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'members' && (
                <MemberTable 
                    users={filteredUsers}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterPlan={filterPlan}
                    setFilterPlan={setFilterPlan}
                    onUpdateSoldier={updateUserSoldier}
                    onToggleStatus={toggleUserStatus}
                    onResetMT5={resetMT5}
                    onDeleteUser={handleDeleteUser}
                    // 🚀 SOI HẦM NGẦM: Chuyển hướng trang (Hết lỗi mờ)
                    onInspect={(u: any) => router.push(`/admin/member/${u.id}`)} 
                />
            )}

            {activeTab === 'finance' && (
                <div className="space-y-6">
                    <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-black text-yellow-500 uppercase mb-6 flex items-center gap-2"><Wallet/> Withdrawal Requests</h3>
                        {withdrawRequests.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 italic">Không có yêu cầu rút tiền nào đang chờ.</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {withdrawRequests.map(req => (
                                    <AdminWithdrawCard key={req.id} targetUser={req} adminUser={adminUser} onComplete={fetchUsers} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
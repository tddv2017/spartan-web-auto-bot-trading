"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';
import { 
  ShieldAlert, RefreshCw, Wallet, UserPlus, 
  LayoutDashboard, Users, Banknote, Server, Activity,
  CheckCircle2, XCircle 
} from 'lucide-react';

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

  const pendingUsers = useMemo(() => users.filter(u => u.accountStatus === 'pending'), [users]);
  const withdrawRequests = useMemo(() => users.filter(u => Number(u.wallet?.pending || 0) > 0), [users]);
  const activeUsers = useMemo(() => users.filter(u => u.accountStatus === 'active' && u.mt5Account), [users]);
  const totalPendingWithdraw = useMemo(() => withdrawRequests.reduce((acc, curr) => acc + Number(curr.wallet?.pending || 0), 0), [withdrawRequests]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      userList.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUsers(userList);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchUsers(); }, [isAdmin]);

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

  // --- ACTIONS ---
  const updateUserSoldier = async (userId: string, currentExpiry: any, days: number, plan: string) => {
    if(!confirm(`Nâng cấp gói ${plan.toUpperCase()}?`)) return;
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
    } catch (e) { alert("Lỗi!"); }
  };

  const toggleUserStatus = async (user: any) => {
      const isPaused = user.remoteCommand === "PAUSE";
      const newCommand = isPaused ? "RUN" : "PAUSE";
      if(!confirm(`Đổi trạng thái Bot thành: ${newCommand}?`)) return;
      try {
          await updateDoc(doc(db, "users", user.id), {
              remoteCommand: newCommand,
              intelMessage: isPaused ? "MARKET STABLE" : "⚠️ ADMIN PAUSED YOUR BOT",
          });
          fetchUsers();
      } catch (e) {}
  };

  const handleApproveUser = async (user: any) => {
     if(!confirm(`Duyệt: ${user.email}?`)) return;
     try {
         await updateDoc(doc(db, "users", user.id), {
            accountStatus: 'active', plan: 'free', 
            expiryDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), 
            remoteCommand: "RUN",
            intelMessage: "MARKET STABLE"
         });
         fetchUsers();
     } catch (e) {}
  };

  const handleRejectUser = async (user: any) => {
     if(!confirm("Từ chối User này?")) return;
     try { await updateDoc(doc(db, "users", user.id), { accountStatus: 'rejected' }); fetchUsers(); } catch (e) {}
  };

  const handleDeleteUser = async (userId: string) => {
      if(!confirm("⚠️ XÓA VĨNH VIỄN USER?")) return;
      try { await deleteDoc(doc(db, "users", userId)); fetchUsers(); } catch (e) {}
  };

  const resetMT5 = async (userId: string) => {
    if(!confirm("Gỡ kết nối MT5 ID?")) return;
    await updateDoc(doc(db, "users", userId), { mt5Account: "" });
    fetchUsers();
  };

  if (!isAdmin) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-slate-500 font-mono">:: Access Denied ::</div>;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans pb-24 selection:bg-blue-500/30">
      
      {/* Cấu trúc Header Dashboard chuyên nghiệp */}
      <header className="sticky top-0 z-50 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <ShieldAlert className="text-white" size={18} />
                  </div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Spartan Admin</h1>
              </div>
              <button onClick={fetchUsers} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors">
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
          </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 mt-4">
        
        <EmergencyPanel onRefresh={fetchUsers} adminUser={adminUser} />

        {/* THẺ THỐNG KÊ NHANH */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <StatCard label="Tổng Quân Số" value={users.length} icon={Users} color="blue" subValue={`${activeUsers.length} Active Bot`} />
            <StatCard label="Chờ Duyệt" value={pendingUsers.length} icon={UserPlus} color="red" subValue={pendingUsers.length > 0 ? "Requires Action" : "All Clear"} />
            <StatCard label="Yêu Cầu Rút" value={`$${totalPendingWithdraw.toFixed(2)}`} icon={Wallet} color="amber" subValue={`${withdrawRequests.length} Đơn`} />
            <StatCard label="Hệ Thống" value="Online" icon={Server} color="emerald" subValue="Latency: 12ms" />
        </div>

        {/* HỆ THỐNG TABS */}
        <div className="flex border-b border-slate-800 bg-[#111827] rounded-t-2xl px-2 pt-2 overflow-x-auto no-scrollbar">
            <AdminTabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Tổng Quan" alertCount={pendingUsers.length} />
            <AdminTabButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={Users} label="Quản Lý Lính" alertCount={0} />
            <AdminTabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={Banknote} label="Thanh Toán" alertCount={withdrawRequests.length} />
        </div>

        <div className="min-h-[500px] animate-in fade-in duration-300 pt-2">
            
            {/* TAB: TỔNG QUAN */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* KHỐI DUYỆT TÂN BINH */}
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-6">
                          <UserPlus size={16} className="text-blue-500"/> Chờ Phê Duyệt ({pendingUsers.length})
                        </h3>
                        {pendingUsers.length === 0 ? <div className="text-center py-12 text-slate-500 text-sm">Không có đơn xin gia nhập mới.</div> : (
                            <div className="space-y-3">
                                {pendingUsers.map(u => (
                                    <div key={u.id} className="bg-[#0B1120] border border-slate-800/60 p-4 rounded-xl flex justify-between items-center">
                                        <div>
                                          <p className="font-bold text-white text-sm">{u.displayName}</p>
                                          <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApproveUser(u)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"><CheckCircle2 size={18}/></button>
                                            <button onClick={() => handleRejectUser(u)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"><XCircle size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* LIVE ACTIVITY */}
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-6">
                          <Activity size={16} className="text-emerald-500"/> Log Hoạt Động (Demo)
                        </h3>
                        <div className="space-y-5">
                            {[1,2,3].map((_,i) => (
                              <div key={i} className="flex gap-4 items-start relative">
                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-[#111827] z-10"></div>
                                {i !== 2 && <div className="absolute top-3 left-1 w-px h-8 bg-slate-800"></div>}
                                <div>
                                  <p className="text-sm text-slate-300">Quét tín hiệu máy chủ MT5-{i+1} hoàn tất.</p>
                                  <span className="text-[10px] text-slate-500">2 phút trước</span>
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: DANH SÁCH LÍNH */}
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
                />
            )}

            {/* TAB: THANH TOÁN RÚT TIỀN */}
            {activeTab === 'finance' && (
                <div className="space-y-6">
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                              <Wallet size={16} className="text-amber-500"/> Yêu Cầu Rút Hoa Hồng
                            </h3>
                            <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">{withdrawRequests.length} Pending</span>
                        </div>
                        
                        {withdrawRequests.length === 0 ? (
                            <div className="text-center py-16 text-slate-500 text-sm">Không có đơn yêu cầu rút tiền nào.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
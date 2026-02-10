"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, query, where, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Crown, Zap, RefreshCw, Infinity, Search, Wallet, CheckCircle, XCircle, Trash2, LayoutDashboard, Users, Banknote, Activity, Server, UserPlus } from 'lucide-react';

// Giữ nguyên các component StatCard và AdminTabButton của ông
const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
  <div className={`bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-${color}-500/50 transition-all`}>
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-500`}><Icon size={60} /></div>
    <div className="relative z-10">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">{label}</p>
        <h3 className={`text-3xl font-black font-mono text-white`}>{value}</h3>
        {subValue && <p className={`text-xs mt-1 font-bold text-${color}-500`}>{subValue}</p>}
    </div>
  </div>
);

const AdminTabButton = ({ active, onClick, icon: Icon, label, alertCount }: any) => (
    <button onClick={onClick} className={`relative flex items-center gap-3 px-6 py-4 transition-all duration-300 border-b-2 ${active ? 'border-green-500 bg-green-500/10 text-white' : 'border-transparent text-slate-500 hover:text-green-400 hover:bg-white/5'}`}>
      <Icon size={18} className={active ? "text-green-500" : ""} />
      <span className="font-bold uppercase tracking-widest text-sm">{label}</span>
      {alertCount > 0 && ( <span className="ml-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{alertCount}</span> )}
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
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchUsers(); }, [isAdmin]);

  // 🔥 LOGIC NÂNG CẤP + CHIA TIỀN MANUAL (GIỮ UI)
  const updateUserSoldier = async (userId: string, currentExpiry: any, days: number, plan: string) => {
    if(!confirm(`Xác nhận nâng cấp gói ${plan.toUpperCase()}?`)) return;
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
        const userData = userSnap.data();

        let newDate;
        if (plan === 'LIFETIME') newDate = Timestamp.fromDate(new Date("2099-12-31T23:59:59"));
        else {
            const now = Date.now();
            const baseDate = (currentExpiry?.seconds * 1000 > now) ? new Date(currentExpiry.seconds * 1000) : new Date();
            baseDate.setDate(baseDate.getDate() + days);
            newDate = Timestamp.fromDate(baseDate);
        }

        await updateDoc(userRef, { expiryDate: newDate, plan: plan, accountStatus: 'active' });

        // 🚀 BẮN HOA HỒNG CHO SẾP (REFERRER)
        if (userData.referredBy) {
            const planPrices: any = { "starter": 30, "yearly": 299, "LIFETIME": 999 };
            const comm = Number(((planPrices[plan] || 0) * 0.4).toFixed(2));

            const q = query(collection(db, "users"), where("licenseKey", "==", userData.referredBy));
            const qSnap = await getDocs(q);

            if (!qSnap.empty) {
                const refDoc = qSnap.docs[0];
                const refData = refDoc.data();
                await updateDoc(refDoc.ref, {
                    "wallet.available": Number(((refData.wallet?.available || 0) + comm).toFixed(2)),
                    referrals: (refData.referrals || []).map((r: any) => 
                        (r.uid === userId || r.email === userData.email) 
                        ? { ...r, status: 'approved', plan: plan, commission: comm, updatedAt: new Date().toISOString() } 
                        : r
                    )
                });
            }
        }
        fetchUsers();
        alert("✅ Đã nâng cấp & Chia hoa hồng!");
    } catch (e) { alert(e); }
  };

  // Giữ nguyên các hàm Approve, Reject, Delete của ông...
  const handleDeleteUser = async (userId: string) => {
      if(!confirm("⚠️ XÓA VĨNH VIỄN User?")) return;
      try { await deleteDoc(doc(db, "users", userId)); fetchUsers(); } catch (e) { alert(e); }
  };

  if (!isAdmin) return <div className="p-20 text-red-500 font-black">ACCESS DENIED</div>;

  return (
    <div className="min-h-screen bg-[#050b14] text-white p-6">
      {/* Giữ nguyên toàn bộ phần Render UI Dashboard, Members List, Finance của ông bên dưới */}
      {/* ... (Chỉ cần đảm bảo truyền đúng hàm updateUserSoldier vào các nút bấm) ... */}
    </div>
  );
}
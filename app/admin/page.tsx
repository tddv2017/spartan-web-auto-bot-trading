"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, query, where, getDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Crown, Zap, RefreshCw, Infinity, 
  Search, Filter, UserCheck, AlertTriangle, FileText, DollarSign,
  Wallet, CheckCircle, XCircle, ArrowRight
} from 'lucide-react';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]); // Danh sách người rút tiền
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  // 💰 BẢNG HOA HỒNG
  const COMMISSION_RATES: any = {
    starter: 12,
    yearly: 119.6,
    LIFETIME: 3999.6
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sắp xếp
      userList.sort((a: any, b: any) => {
        if (a.plan === 'LIFETIME' && b.plan !== 'LIFETIME') return -1;
        if (b.plan === 'LIFETIME' && a.plan !== 'LIFETIME') return 1;
        return (a.expiryDate?.seconds || 0) - (b.expiryDate?.seconds || 0);
      });

      setUsers(userList);
      setFilteredUsers(userList);

      // 🔍 LỌC RA NHỮNG AI ĐANG RÚT TIỀN (Pending > 0)
      const pendingUsers = userList.filter((u: any) => u.wallet?.pending > 0);
      setWithdrawRequests(pendingUsers);

    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  // Filter Logic
  useEffect(() => {
    let result = users;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.email && u.email.toLowerCase().includes(lowerTerm)) || 
        (u.licenseKey && u.licenseKey.toLowerCase().includes(lowerTerm)) ||
        (u.displayName && u.displayName.toLowerCase().includes(lowerTerm))
      );
    }
    if (filterPlan !== "all") {
      result = result.filter(u => (u.plan || "free") === filterPlan);
    }
    setFilteredUsers(result);
  }, [searchTerm, filterPlan, users]);

  // 💸 1. DUYỆT RÚT TIỀN (CHUYỂN KHOẢN XONG -> BẤM NÚT NÀY)
  const approveWithdraw = async (user: any) => {
    const amount = user.wallet.pending;
    if(!confirm(`XÁC NHẬN ĐÃ CHUYỂN KHOẢN?\n\nKhách: ${user.email}\nSố tiền: $${amount}\n\nHành động: Trừ Pending -> Cộng Total Paid`)) return;

    try {
        const userRef = doc(db, "users", user.id);
        const newWallet = {
            ...user.wallet,
            pending: 0, // Xóa pending
            total_paid: Number((user.wallet.total_paid + amount).toFixed(2)) // Cộng vào đã trả
        };

        await updateDoc(userRef, { wallet: newWallet });
        alert("✅ Đã duyệt thành công!");
        fetchUsers();
    } catch (e) {
        alert("Lỗi: " + e);
    }
  };

  // 💸 2. TỪ CHỐI RÚT TIỀN (HOÀN LẠI VÍ)
  const rejectWithdraw = async (user: any) => {
    const amount = user.wallet.pending;
    if(!confirm(`TỪ CHỐI YÊU CẦU NÀY?\n\nKhách: ${user.email}\nSố tiền: $${amount}\n\nHành động: Trừ Pending -> Hoàn lại Available`)) return;

    try {
        const userRef = doc(db, "users", user.id);
        const newWallet = {
            ...user.wallet,
            pending: 0,
            available: Number((user.wallet.available + amount).toFixed(2)) // Hoàn tiền lại ví chính
        };

        await updateDoc(userRef, { wallet: newWallet });
        alert("🚫 Đã hoàn tiền về ví khách hàng!");
        fetchUsers();
    } catch (e) {
        alert("Lỗi: " + e);
    }
  };

  // ... (Giữ nguyên các hàm updateUserSoldier, resetMT5, downloadAgreementTxt cũ) ...
  const updateUserSoldier = async (userId: string, currentExpiry: any, days: number, plan: string, manualDate?: string) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data();

    let newDate;
    try {
      if (manualDate) {
        newDate = Timestamp.fromDate(new Date(manualDate));
      } else if (plan === 'LIFETIME') {
        newDate = Timestamp.fromDate(new Date("2099-12-31T23:59:59"));
      } else {
        const now = Date.now();
        const expiryMillis = currentExpiry ? currentExpiry.seconds * 1000 : 0;
        const baseDate = (expiryMillis > now) ? new Date(expiryMillis) : new Date();
        baseDate.setDate(baseDate.getDate() + days);
        newDate = Timestamp.fromDate(baseDate);
      }
      
      await updateDoc(userRef, { expiryDate: newDate, plan: plan });

      // Auto Commission Logic
      const referrerKey = userData.referredBy;
      if (referrerKey) {
          const q = query(collection(db, "users"), where("licenseKey", "==", referrerKey));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              const referrerDoc = querySnapshot.docs[0];
              const referrerData = referrerDoc.data();
              const commissionAmount = COMMISSION_RATES[plan] || 0;

              if (commissionAmount > 0) {
                  const oldReferralObj = referrerData.referrals?.find((r: any) => r.user === (userData.displayName || userData.email));
                  const newReferralObj = {
                      user: userData.displayName || userData.email,
                      date: new Date().toLocaleDateString('vi-VN'),
                      package: plan.toUpperCase(),
                      commission: commissionAmount,
                      status: "approved"
                  };
                  const currentBalance = referrerData.wallet?.available || 0;
                  const newBalance = Number((currentBalance + commissionAmount).toFixed(2));

                  await updateDoc(referrerDoc.ref, {
                      "wallet.available": newBalance,
                      referrals: oldReferralObj ? arrayRemove(oldReferralObj) : referrerData.referrals,
                  });
                  await updateDoc(referrerDoc.ref, { referrals: arrayUnion(newReferralObj) });
                  alert(`✅ Đã cộng $${commissionAmount} hoa hồng cho đại lý!`);
              }
          }
      }
      fetchUsers(); 
    } catch (e) { alert("❌ Lỗi: " + e); }
  };

  const resetMT5 = async (userId: string) => {
    if(!confirm("⚠️ Reset MT5?")) return;
    try { await updateDoc(doc(db, "users", userId), { mt5Account: "" }); fetchUsers(); } catch (e) { alert(e); }
  };

  const downloadAgreementTxt = (u: any) => { /* Code cũ giữ nguyên */ };

  if (!isAdmin) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-black">🚫 ADMIN ONLY</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-end pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-4 italic mb-2">
              <ShieldAlert className="text-red-600 animate-pulse" size={48} /> TỔNG HÀNH DINH
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Hệ thống quản trị Spartan V8.0</p>
          </div>
          <button onClick={fetchUsers} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-700">
             <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* 🔥 NEW: KHU VỰC KẾ TOÁN (CHỈ HIỆN NẾU CÓ YÊU CẦU RÚT TIỀN) */}
        {withdrawRequests.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-900/20 to-slate-900 border border-yellow-500/30 rounded-3xl p-6 animate-in slide-in-from-top duration-500">
                <h3 className="text-yellow-500 font-black text-xl mb-4 flex items-center gap-2 uppercase">
                    <Wallet className="animate-bounce" /> Yêu cầu rút tiền cần xử lý ({withdrawRequests.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {withdrawRequests.map((req) => (
                        <div key={req.id} className="bg-slate-950 border border-slate-700 p-4 rounded-2xl flex flex-col gap-3 shadow-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-white text-lg">{req.displayName}</div>
                                    <div className="text-xs text-slate-400 font-mono">{req.email}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Rút tiền</div>
                                    <div className="text-2xl font-black text-green-400">${req.wallet.pending}</div>
                                </div>
                            </div>
                            
                            {/* Thông tin Bank (Nếu có lưu trong DB thì hiện, ko thì hiện Email để contact) */}
                            <div className="bg-slate-900 p-2 rounded text-xs text-slate-300 border border-slate-800">
                                ⚠️ Vui lòng liên hệ Email/Tele để lấy STK Ngân hàng.
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button 
                                    onClick={() => rejectWithdraw(req)}
                                    className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-500 py-2 rounded-lg font-bold text-xs border border-red-900/50 flex items-center justify-center gap-1 transition-colors"
                                >
                                    <XCircle size={14}/> TỪ CHỐI
                                </button>
                                <button 
                                    onClick={() => approveWithdraw(req)}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-xs border border-green-500 shadow-lg shadow-green-900/50 flex items-center justify-center gap-1 transition-all active:scale-95"
                                >
                                    <CheckCircle size={14}/> DUYỆT CHI
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TOOLBAR */}
        <div className="flex gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 text-slate-500" size={24} />
            <input type="text" placeholder="Tìm kiếm..." className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-green-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="bg-slate-950 border border-slate-700 rounded-2xl px-6 text-white outline-none cursor-pointer" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
             <option value="all">Tất cả</option>
             <option value="starter">PRO Daily</option>
             <option value="yearly">VIP Yearly</option>
             <option value="LIFETIME">Lifetime</option>
          </select>
        </div>

        {/* TABLE (GIỮ NGUYÊN) */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[500px]">
          {loading && <div className="absolute inset-0 bg-slate-900/90 z-50 flex items-center justify-center"><RefreshCw className="animate-spin text-green-500" size={60} /></div>}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-sm uppercase font-black tracking-widest border-b border-slate-800">
                  <th className="p-6">Chiến binh</th>
                  <th className="p-6">Ví Tiền</th>
                  <th className="p-6 text-center">Quân hàm</th>
                  <th className="p-6">Hạn sử dụng</th>
                  <th className="p-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-base">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-6">
                        <div className="font-bold text-white">{u.displayName}</div>
                        <div className="text-sm text-slate-500 font-mono">{u.email}</div>
                        <div className="text-xs text-green-500 font-mono mt-1">{u.licenseKey}</div>
                    </td>
                    <td className="p-6">
                        <div className="flex flex-col gap-1 text-xs font-mono">
                            <span className="text-green-400">Avail: ${u.wallet?.available || 0}</span>
                            <span className="text-yellow-500">Pend: ${u.wallet?.pending || 0}</span>
                            <span className="text-slate-500">Paid: ${u.wallet?.total_paid || 0}</span>
                        </div>
                    </td>
                    <td className="p-6 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black border ${u.plan === 'LIFETIME' ? 'bg-purple-900 border-purple-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>{u.plan || "FREE"}</span>
                    </td>
                    <td className="p-6 text-sm font-bold text-slate-300">
                        {u.plan === 'LIFETIME' ? '∞ Vĩnh viễn' : u.expiryDate ? new Date(u.expiryDate.seconds * 1000).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => updateUserSoldier(u.id, u.expiryDate, 30, "starter")} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 text-white" title="Gia hạn PRO"><Zap size={16}/></button>
                            <button onClick={() => updateUserSoldier(u.id, u.expiryDate, 365, "yearly")} className="p-2 bg-amber-500 rounded-lg hover:bg-amber-400 text-black" title="Gia hạn VIP"><Crown size={16}/></button>
                            <button onClick={() => updateUserSoldier(u.id, null, 0, "LIFETIME")} className="p-2 bg-purple-600 rounded-lg hover:bg-purple-500 text-white" title="Kích hoạt AGENCY"><Infinity size={16}/></button>
                            <button onClick={() => resetMT5(u.id)} className="p-2 bg-red-900/50 rounded-lg hover:bg-red-500 text-red-500 hover:text-white border border-red-900" title="Reset MT5"><RefreshCw size={16}/></button>
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
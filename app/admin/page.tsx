"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, query, where, getDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Crown, Zap, RefreshCw, Infinity, 
  Search, Wallet, CheckCircle, XCircle, CreditCard, Bitcoin, Copy, UserPlus, Clock
} from 'lucide-react';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]); 
  const [pendingUsers, setPendingUsers] = useState<any[]>([]); // 👈 STATE MỚI: TÂN BINH CHỜ DUYỆT
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
      
      // Sắp xếp: Lifetime lên đầu -> còn hạn -> hết hạn
      userList.sort((a: any, b: any) => {
        if (a.plan === 'LIFETIME' && b.plan !== 'LIFETIME') return -1;
        if (b.plan === 'LIFETIME' && a.plan !== 'LIFETIME') return 1;
        return (b.expiryDate?.seconds || 0) - (a.expiryDate?.seconds || 0);
      });

      setUsers(userList);
      setFilteredUsers(userList);

      // 🔍 1. LỌC KHÁCH ĐANG RÚT TIỀN (Pending > 0)
      setWithdrawRequests(userList.filter((u: any) => u.wallet?.pending > 0));

      // 🔍 2. LỌC KHÁCH CHỜ DUYỆT (accountStatus == 'pending')
      setPendingUsers(userList.filter((u: any) => u.accountStatus === 'pending'));

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

  const handleApproveUser = async (user: any) => {
      // 👇 1. Sửa nội dung thông báo cho đúng
     if(!confirm(`DUYỆT TÂN BINH NÀY?\n\nEmail: ${user.email}\nMT5: ${user.mt5Account}\n\n-> Gói sẽ set thành: FREE (7 Ngày)`)) return;
 
     try {
         const userRef = doc(db, "users", user.id);
         await updateDoc(userRef, {
            accountStatus: 'active', 
             plan: 'free', // Nên để chữ thường cho đồng bộ với hệ thống
              
              // 👇 2. SỬA SỐ 30 THÀNH SỐ 7 Ở ĐÂY
              // Công thức: Số ngày * 24 giờ * 60 phút * 60 giây * 1000 mili giây
             expiryDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), 
              
             approvedAt: new Date().toISOString()
         });
         alert("✅ Đã kích hoạt gói FREE (7 ngày) thành công!");
         fetchUsers();
     } catch (e) { alert("Lỗi: " + e); }
    };

  const handleRejectUser = async (user: any) => {
      if(!confirm("TỪ CHỐI TÂN BINH NÀY?")) return;
      try {
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, {
              accountStatus: 'rejected',
              rejectedAt: new Date().toISOString()
          });
          fetchUsers();
      } catch (e) { alert("Lỗi: " + e); }
  };

  // --- XỬ LÝ RÚT TIỀN ---
  const approveWithdraw = async (user: any) => {
    const amount = user.wallet.pending;
    if(!confirm(`XÁC NHẬN ĐÃ CHUYỂN KHOẢN?\n\nKhách: ${user.email}\nSố tiền: $${amount}`)) return;
    try {
        const userRef = doc(db, "users", user.id);
        const newWallet = { ...user.wallet, pending: 0, total_paid: Number((user.wallet.total_paid + amount).toFixed(2)) };
        await updateDoc(userRef, { wallet: newWallet });
        alert("✅ Đã duyệt rút tiền!");
        fetchUsers();
    } catch (e) { alert("Lỗi: " + e); }
  };

  const rejectWithdraw = async (user: any) => {
    const amount = user.wallet.pending;
    if(!confirm(`TỪ CHỐI RÚT TIỀN? Tiền sẽ hoàn về ví.`)) return;
    try {
        const userRef = doc(db, "users", user.id);
        const newWallet = { ...user.wallet, pending: 0, available: Number((user.wallet.available + amount).toFixed(2)) };
        await updateDoc(userRef, { wallet: newWallet });
        alert("🚫 Đã hoàn tiền!");
        fetchUsers();
    } catch (e) { alert("Lỗi: " + e); }
  };

  // ... (Hàm renderPaymentInfo, updateUserSoldier, resetMT5 GIỮ NGUYÊN) ...
  const renderPaymentInfo = (user: any) => {
      if (user.cryptoInfo?.walletAddress) {
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user.cryptoInfo.walletAddress}`;
          return (
              <div className="bg-slate-900 p-3 rounded-xl border border-green-900/50 mt-2">
                  <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 overflow-hidden">
                          <div className="text-[10px] text-green-500 font-bold uppercase flex items-center gap-1 mb-1"><Bitcoin size={12}/> {user.cryptoInfo.network}</div>
                          <div className="bg-black/40 p-2 rounded border border-slate-700 font-mono text-xs text-slate-300 break-all select-all">{user.cryptoInfo.walletAddress}</div>
                      </div>
                      <div className="bg-white p-1 rounded-lg shrink-0"><img src={qrUrl} alt="QR" className="w-20 h-20 object-contain" /></div>
                  </div>
              </div>
          );
      } else if (user.bankInfo?.accountNumber) {
          const qrText = user.bankInfo.accountNumber;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrText}`;
          return (
              <div className="bg-slate-900 p-3 rounded-xl border border-blue-900/50 mt-2">
                  <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                          <div className="text-[10px] text-blue-400 font-bold uppercase flex items-center gap-1 mb-1"><CreditCard size={12}/> Bank Transfer</div>
                          <div className="space-y-1">
                              <p className="text-xs font-bold text-white">{user.bankInfo.bankName}</p>
                              <p className="text-lg font-mono font-black text-yellow-500 select-all">{user.bankInfo.accountNumber}</p>
                              <p className="text-xs text-slate-400 uppercase">{user.bankInfo.accountHolder}</p>
                          </div>
                      </div>
                      <div className="bg-white p-1 rounded-lg shrink-0 flex flex-col items-center"><img src={qrUrl} alt="QR" className="w-16 h-16 object-contain" /></div>
                  </div>
              </div>
          );
      }
      return <div className="bg-red-900/20 p-3 rounded-xl border border-red-900/50 mt-2 text-center text-xs text-red-500 font-bold italic">⚠️ Chưa cài đặt ví!</div>;
  };

  const updateUserSoldier = async (userId: string, currentExpiry: any, days: number, plan: string, manualDate?: string) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data();
    let newDate;
    if (manualDate) newDate = Timestamp.fromDate(new Date(manualDate));
    else if (plan === 'LIFETIME') newDate = Timestamp.fromDate(new Date("2099-12-31T23:59:59"));
    else {
        const now = Date.now();
        const expiryMillis = currentExpiry ? currentExpiry.seconds * 1000 : 0;
        const baseDate = (expiryMillis > now) ? new Date(expiryMillis) : new Date();
        baseDate.setDate(baseDate.getDate() + days);
        newDate = Timestamp.fromDate(baseDate);
    }
    await updateDoc(userRef, { expiryDate: newDate, plan: plan });
    
    // Auto Commission (Giữ nguyên)
    const referrerKey = userData.referredBy;
    if (referrerKey) {
        const q = query(collection(db, "users"), where("licenseKey", "==", referrerKey));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const referrerDoc = querySnapshot.docs[0];
            const commissionAmount = COMMISSION_RATES[plan] || 0;
            if (commissionAmount > 0) {
                const newBalance = Number((referrerDoc.data().wallet?.available || 0 + commissionAmount).toFixed(2));
                await updateDoc(referrerDoc.ref, { "wallet.available": newBalance });
                alert(`✅ Đã cộng $${commissionAmount} hoa hồng!`);
            }
        }
    }
    fetchUsers(); 
  };

  const resetMT5 = async (userId: string) => {
    if(!confirm("⚠️ Reset MT5?")) return;
    try { await updateDoc(doc(db, "users", userId), { mt5Account: "" }); fetchUsers(); } catch (e) { alert(e); }
  };

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

        {/* 🔥 1. KHU VỰC DUYỆT TÂN BINH (CHỜ DUYỆT) - ĐÃ BỔ SUNG 🔥 */}
        {pendingUsers.length > 0 && (
            <div className="bg-red-950/20 border border-red-500/50 rounded-3xl p-6 animate-in slide-in-from-top duration-500">
                <h3 className="text-red-500 font-black text-xl mb-4 flex items-center gap-2 uppercase tracking-widest animate-pulse">
                    <UserPlus /> CÓ {pendingUsers.length} TÂN BINH CẦN DUYỆT
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingUsers.map((user) => (
                        <div key={user.id} className="bg-black/60 border border-red-800 p-4 rounded-2xl flex flex-col gap-3 shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-white text-lg">{user.displayName || "Unknown"}</div>
                                    <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                                </div>
                                <Clock size={16} className="text-yellow-500"/>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">ID MT5 Yêu cầu:</p>
                                <p className="text-2xl font-mono font-black text-yellow-400 tracking-wider">{user.mt5Account}</p>
                            </div>
                            <div className="text-[10px] text-slate-500 text-center">
                                Gửi lúc: {user.submittedAt ? new Date(user.submittedAt).toLocaleString('vi-VN') : 'N/A'}
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => handleRejectUser(user)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg font-bold text-xs border border-slate-600">HUỶ BỎ</button>
                                <button onClick={() => handleApproveUser(user)} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-xs border border-green-500 shadow-lg shadow-green-900/50 flex items-center justify-center gap-1">
                                    <CheckCircle size={14}/> DUYỆT (STARTER)
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* 🔥 2. KHU VỰC KẾ TOÁN (RÚT TIỀN) */}
        {withdrawRequests.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-900/20 to-slate-900 border border-yellow-500/30 rounded-3xl p-6">
                <h3 className="text-yellow-500 font-black text-xl mb-4 flex items-center gap-2 uppercase">
                    <Wallet className="animate-bounce" /> Yêu cầu rút tiền ({withdrawRequests.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {withdrawRequests.map((req) => (
                        <div key={req.id} className="bg-slate-950 border border-slate-700 p-4 rounded-2xl flex flex-col gap-3 shadow-xl relative overflow-hidden">
                            <div className="flex justify-between items-start z-10">
                                <div>
                                    <div className="font-bold text-white text-lg truncate w-40">{req.displayName}</div>
                                    <div className="text-xs text-slate-400 font-mono">{req.email}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Rút tiền</div>
                                    <div className="text-2xl font-black text-green-400">${req.wallet.pending}</div>
                                </div>
                            </div>
                            {renderPaymentInfo(req)}
                            <div className="flex gap-2 mt-auto pt-4">
                                <button onClick={() => rejectWithdraw(req)} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-500 py-2 rounded-lg font-bold text-xs border border-red-900/30 flex items-center justify-center gap-1"><XCircle size={14}/> TỪ CHỐI</button>
                                <button onClick={() => approveWithdraw(req)} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-xs border border-green-500 shadow-lg shadow-green-900/50 flex items-center justify-center gap-1"><CheckCircle size={14}/> DUYỆT CHI</button>
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

        {/* TABLE */}
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
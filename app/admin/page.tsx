"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, query, where, getDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Crown, Zap, RefreshCw, Infinity, 
  Search, Filter, UserCheck, AlertTriangle, FileText, DollarSign 
} from 'lucide-react';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  // 💰 BẢNG HOA HỒNG (40% GIÁ TRỊ GÓI)
  const COMMISSION_RATES: any = {
    starter: 12,      // $30 * 40% = $12
    yearly: 119.6,    // $299 * 40% = $119.6
    LIFETIME: 3999.6  // $9999 * 40% = $3999.6
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      userList.sort((a: any, b: any) => {
        if (a.plan === 'LIFETIME' && b.plan !== 'LIFETIME') return -1;
        if (b.plan === 'LIFETIME' && a.plan !== 'LIFETIME') return 1;
        const dateA = a.expiryDate?.seconds || 0;
        const dateB = b.expiryDate?.seconds || 0;
        return dateA - dateB;
      });

      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

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

  // 🚀 HÀM CẤP PHÉP & TRẢ THƯỞNG (CORE)
  const updateUserSoldier = async (userId: string, currentExpiry: any, days: number, plan: string, manualDate?: string) => {
    const userRef = doc(db, "users", userId);
    
    // 1. Lấy thông tin user hiện tại để check người giới thiệu
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data();

    let newDate;
    try {
      // --- XỬ LÝ NGÀY HẾT HẠN ---
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
      
      // --- CẬP NHẬT GÓI CHO KHÁCH ---
      await updateDoc(userRef, { 
          expiryDate: newDate, 
          plan: plan 
      });

      // --- 🔥 XỬ LÝ HOA HỒNG (AUTO COMMISSION 40%) ---
      const referrerKey = userData.referredBy;
      if (referrerKey) {
          // Tìm ông Reseller
          const q = query(collection(db, "users"), where("licenseKey", "==", referrerKey));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
              const referrerDoc = querySnapshot.docs[0];
              const referrerData = referrerDoc.data();
              const commissionAmount = COMMISSION_RATES[plan] || 0;

              if (commissionAmount > 0) {
                  // 1. Tìm object cũ trong mảng referrals (trạng thái pending)
                  const oldReferralObj = referrerData.referrals?.find((r: any) => r.user === (userData.displayName || userData.email));
                  
                  // 2. Tạo object mới (trạng thái approved)
                  const newReferralObj = {
                      user: userData.displayName || userData.email,
                      date: new Date().toLocaleDateString('vi-VN'),
                      package: plan.toUpperCase(),
                      commission: commissionAmount,
                      status: "approved" // ✅ Đã duyệt
                  };

                  // 3. Tính toán số dư mới (Làm tròn 2 chữ số thập phân)
                  const currentBalance = referrerData.wallet?.available || 0;
                  const newBalance = Number((currentBalance + commissionAmount).toFixed(2));

                  // 4. Cập nhật Ví tiền + Danh sách Ref
                  // Lưu ý: Cần xóa cũ thêm mới để update status
                  await updateDoc(referrerDoc.ref, {
                      // Cộng tiền vào ví Available
                      "wallet.available": newBalance,
                      // Xóa dòng pending cũ (nếu có)
                      referrals: oldReferralObj ? arrayRemove(oldReferralObj) : referrerData.referrals,
                  });
                  
                  // Thêm dòng đã duyệt vào
                  await updateDoc(referrerDoc.ref, {
                      referrals: arrayUnion(newReferralObj)
                  });

                  alert(`✅ Đã kích hoạt gói ${plan}!\n💰 Đã cộng $${commissionAmount} (40%) hoa hồng cho đại lý: ${referrerKey}`);
              } else {
                  alert(`✅ Đã kích hoạt gói ${plan}! (Không có hoa hồng)`);
              }
          } else {
              alert(`✅ Đã kích hoạt gói ${plan}! (Không tìm thấy người giới thiệu)`);
          }
      } else {
          alert(`✅ Đã kích hoạt gói ${plan}!`);
      }

      fetchUsers(); 
    } catch (e) {
      console.error(e);
      alert("❌ Lỗi cập nhật: " + e);
    }
  };

  const resetMT5 = async (userId: string) => {
    if(!confirm("⚠️ CẢNH BÁO: Bạn chắc chắn muốn xóa liên kết MT5 của tài khoản này?")) return;
    try {
      await updateDoc(doc(db, "users", userId), { mt5Account: "" });
      alert("✅ Đã reset tài khoản MT5!");
      fetchUsers();
    } catch (e) {
      alert("Lỗi: " + e);
    }
  };

  const downloadAgreementTxt = (u: any) => {
    const timeString = new Date().toLocaleString('vi-VN');
    const expiryStr = u.expiryDate ? new Date(u.expiryDate.seconds * 1000).toLocaleDateString('vi-VN') : "Chưa kích hoạt";
    const content = `
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---------------------------
BIÊN BẢN XÁC NHẬN SỬ DỤNG DỊCH VỤ SPARTAN AI
...
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BienBan_${u.licenseKey}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-black text-2xl animate-bounce tracking-tighter">
      🚫 KHU VỰC CẤM - CHỈ DÀNH CHO TỔNG TƯ LỆNH
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER & TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 tracking-tighter italic mb-3">
              <ShieldAlert className="text-red-600 animate-pulse" size={48} /> 
              TỔNG HÀNH DINH
            </h1>
            <div className="flex flex-wrap gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-2"><UserCheck size={18} className="text-blue-500"/> Tổng: {users.length}</span>
              <span className="flex items-center gap-2"><Crown size={18} className="text-purple-500"/> Lifetime: {users.filter(u=>u.plan==='LIFETIME').length}</span>
              <span className="flex items-center gap-2"><AlertTriangle size={18} className="text-red-500"/> Hết hạn: {users.filter(u=>u.plan !== 'LIFETIME' && u.expiryDate?.seconds * 1000 < Date.now()).length}</span>
            </div>
          </div>
          <button onClick={fetchUsers} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-xl transition-all border border-slate-700 shadow-lg">
             <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 text-slate-500" size={24} />
            <input 
              type="text" 
              placeholder="Tìm Email / License Key / Ref Code..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-base text-white focus:border-green-500 outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-4 text-slate-500" size={24} />
            <select 
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-base text-white focus:border-green-500 outline-none appearance-none cursor-pointer"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <option value="all">Tất cả quân hàm</option>
              <option value="starter">PRO Daily</option>
              <option value="yearly">VIP Yearly</option>
              <option value="LIFETIME">Lifetime (Agency)</option>
              <option value="free">Lính mới (Free)</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[500px]">
          {loading && (
             <div className="absolute inset-0 bg-slate-900/90 z-50 flex items-center justify-center">
                <RefreshCw className="animate-spin text-green-500" size={60} />
             </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-sm uppercase font-black tracking-widest border-b border-slate-800">
                  <th className="p-6">Chiến binh</th>
                  <th className="p-6">License / Ref</th>
                  <th className="p-6 text-center">Quân hàm</th>
                  <th className="p-6">Hạn sử dụng</th>
                  <th className="p-6 text-center">Hồ sơ</th>
                  <th className="p-6 text-right">Thao tác lệnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-base">
                {filteredUsers.length === 0 ? (
                   <tr><td colSpan={6} className="p-16 text-center text-slate-500 text-lg italic">Không tìm thấy dữ liệu...</td></tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isExpired = u.plan !== 'LIFETIME' && u.expiryDate?.seconds * 1000 < Date.now();
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                        
                        {/* 1. CHIẾN BINH */}
                        <td className="p-6 align-top">
                          <div className="font-bold text-white text-lg mb-1">{u.displayName || "Ẩn danh"}</div>
                          <div className="text-sm text-slate-400 font-mono flex items-center gap-2">{u.email}</div>
                          <div className="text-xs text-slate-600 mt-2 font-mono">ID: {u.id.substring(0,8)}...</div>
                        </td>
                        
                        {/* 2. LICENSE / REF */}
                        <td className="p-6 align-top">
                          <div className="flex flex-col gap-2">
                            <span className="font-mono text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 text-sm w-fit font-bold select-all">
                              {u.licenseKey}
                            </span>
                            {/* Hiển thị người giới thiệu */}
                            {u.referredBy && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                    Ref by: <span className="text-yellow-500 font-bold">{u.referredBy}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-amber-500 font-mono bg-amber-500/5 px-2 py-1 rounded w-fit mt-1">
                               <span>MT5: <strong className="text-amber-400">{u.mt5Account || "---"}</strong></span>
                               {u.mt5Account && (
                                 <button onClick={() => resetMT5(u.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors" title="Reset MT5">
                                   <RefreshCw size={14} />
                                 </button>
                               )}
                            </div>
                          </div>
                        </td>

                        {/* 3. QUÂN HÀM */}
                        <td className="p-6 text-center align-top">
                          <span className={`inline-block px-4 py-2 rounded-xl text-xs font-black uppercase border tracking-wide shadow-lg ${
                            u.plan === 'LIFETIME' ? 'bg-purple-600 text-white border-purple-400' :
                            u.plan === 'yearly' ? 'bg-amber-500 text-black border-amber-300' :
                            u.plan === 'starter' ? 'bg-blue-600 text-white border-blue-400' : 
                            'bg-slate-800 text-slate-400 border-slate-600'
                          }`}>
                            {u.plan || "FREE"}
                          </span>
                        </td>

                        {/* 4. HẠN DÙNG */}
                        <td className="p-6 align-top">
                          <div className={`text-base font-bold mb-1 ${isExpired ? 'text-red-500' : 'text-slate-200'}`}>
                            {u.plan === 'LIFETIME' 
                              ? <span className="flex items-center gap-2 text-purple-400"><Infinity size={20}/> Vĩnh viễn</span> 
                              : u.expiryDate ? new Date(u.expiryDate.seconds * 1000).toLocaleDateString('vi-VN') 
                              : "Chưa kích hoạt"}
                          </div>
                          {isExpired && <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20 inline-block font-bold">⚠️ ĐÃ HẾT HẠN</span>}
                        </td>

                        {/* 5. TẢI FILE */}
                        <td className="p-6 text-center align-top">
                            <button onClick={() => downloadAgreementTxt(u)} className="group/btn flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-green-400 transition-colors">
                                <div className="p-3 bg-slate-800 group-hover/btn:bg-green-500/10 rounded-xl border border-slate-700 group-hover/btn:border-green-500/50 transition-all"><FileText size={20} /></div>
                                <span className="text-[10px] font-bold">TẢI .TXT</span>
                            </button>
                        </td>

                        {/* 6. THAO TÁC */}
                        <td className="p-6 align-top">
                          <div className="flex flex-col items-end gap-3">
                            <input 
                              type="date"
                              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-green-500 w-40 text-right font-mono"
                              onChange={(e) => {
                                if (confirm(`Xác nhận đổi ngày đến: ${e.target.value}?`)) {
                                  updateUserSoldier(u.id, null, 0, u.plan || "starter", e.target.value);
                                  e.target.value = "";
                                }
                              }}
                            />
                            <div className="flex gap-2">
                              <button onClick={() => updateUserSoldier(u.id, u.expiryDate, 30, "starter")} title="+30 Ngày (PRO) - Hoa hồng $12" className="h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg hover:scale-105 border border-blue-400"><Zap size={20} /></button>
                              <button onClick={() => updateUserSoldier(u.id, u.expiryDate, 365, "yearly")} title="+365 Ngày (VIP) - Hoa hồng $119.6" className="h-10 w-10 flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all shadow-lg hover:scale-105 border border-amber-300"><Crown size={20} /></button>
                              <button onClick={() => updateUserSoldier(u.id, null, 0, "LIFETIME")} title="LIFETIME - Hoa hồng $3999.6" className="h-10 w-10 flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-lg hover:scale-105 border border-purple-400"><Infinity size={20} /></button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-center text-sm text-slate-600 italic pb-8">Hệ thống quản trị Spartan V7.2 - Tổng Tư Lệnh Duyệt Lệnh</div>
      </div>
    </div>
  );
}
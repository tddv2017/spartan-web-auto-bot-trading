"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, deleteDoc, writeBatch, deleteField } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Crown, Zap, RefreshCw, Infinity, Search, Wallet, 
  CheckCircle, XCircle, CreditCard, Bitcoin, UserPlus, 
  LayoutDashboard, Users, Banknote, Activity, Server,
  Trash2, QrCode 
} from 'lucide-react';
import { setDoc } from 'firebase/firestore'; // For setting documents

// --- HÀM HỖ TRỢ LẤY MÃ NGÂN HÀNG CHO VIETQR ---
const getVietQRBankCode = (fullName: string) => {
    if (!fullName) return "";
    const name = fullName.toLowerCase();
    if (name.includes("vietinbank")) return "ICB"; 
    if (name.includes("vietcombank")) return "VCB";
    if (name.includes("mbbank") || name.includes("quân đội")) return "MB";
    if (name.includes("techcombank")) return "TCB";
    if (name.includes("acb")) return "ACB";
    if (name.includes("bidv")) return "BIDV";
    if (name.includes("vpbank")) return "VPB";
    if (name.includes("tpbank")) return "TPB";
    if (name.includes("sacombank")) return "STB";
    if (name.includes("vib")) return "VIB";
    if (name.includes("hdbank")) return "HDB";
    if (name.includes("msb")) return "MSB";
    if (name.includes("ocb")) return "OCB";
    if (name.includes("shb")) return "SHB";
    if (name.includes("eximbank")) return "EIB";
    if (name.includes("seabank")) return "SEAB";
    if (name.includes("abbank")) return "ABB";
    if (name.includes("agribank")) return "VBA";
    
    const match = fullName.match(/\(([^)]+)\)/);
    if (match && match[1]) return match[1].trim();
    return fullName.split(' ')[0];
};

// --- ICON DỰ PHÒNG ---
const ScanLine = ({ size }: {size:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>;

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

// ==================================================================
// ☢️ COMPONENT: BẢNG ĐIỀU KHIỂN KHẨN CẤP (ĐÃ UPDATE API BACKUP)
// ==================================================================
const EmergencyPanel = ({ onRefresh, adminUser }: { onRefresh: () => void, adminUser: any }) => {
  const [loading, setLoading] = useState(false);

  // 🔵 1. BACKUP (GỌI API)
  const handleBackup = async () => {
    if (!confirm("💾 SAO LƯU DỮ LIỆU?\n\nToàn bộ dữ liệu sẽ được copy sang bảng 'users_backup_YYYYMMDD'.")) return;
    setLoading(true);
    try {
      const token = await adminUser.getIdToken(); 
      const res = await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.success ? data.message : "❌ Lỗi: " + data.message);
    } catch (e: any) { alert("❌ Lỗi mạng: " + e.message); }
    setLoading(false);
  };

  // 🔴 2. PAUSE (DỪNG TOÀN BỘ)
  const handleEmergencyStop = async () => {
    if (!confirm("⚠️ DỪNG TOÀN BỘ BOT?\nKey của mọi người sẽ đổi thành 'STOP'.")) return;
    setLoading(true);
    try {
      const batch = writeBatch(db); 
      const querySnapshot = await getDocs(collection(db, "users"));
      let count = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.licenseKey && data.licenseKey !== "STOP") {
          batch.update(doc.ref, {
            licenseKey: "STOP",          
            backupKey: data.licenseKey,  
            lastPausedAt: new Date().toISOString()
          });
          count++;
        }
      });
      if (count > 0) { await batch.commit(); alert(`✅ ĐÃ DỪNG ${count} BOT!`); } 
      else { alert("Không có Bot nào đang chạy."); }
      onRefresh(); 
    } catch (e) { alert("❌ Lỗi: " + e); }
    setLoading(false);
  };

  // 🟢 3. RESUME (KHÔI PHỤC)
  const handleRestore = async () => {
    if (!confirm("✅ KHÔI PHỤC HOẠT ĐỘNG?")) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const querySnapshot = await getDocs(collection(db, "users"));
      let count = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.licenseKey === "STOP" && data.backupKey) {
          batch.update(doc.ref, { licenseKey: data.backupKey, backupKey: deleteField() });
          count++;
        }
      });
      if (count > 0) { await batch.commit(); alert(`✅ ĐÃ KHÔI PHỤC ${count} BOT!`); }
      else { alert("Không có Bot nào cần khôi phục."); }
      onRefresh();
    } catch (e) { alert("❌ Lỗi: " + e); }
    setLoading(false);
  };

  return (
    <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-red-500 flex items-center gap-2">
            <ShieldAlert className="animate-pulse"/> EMERGENCY CONTROL (CPI/NEWS)
          </h3>
          <p className="text-slate-400 text-sm mt-1">Khu vực điều khiển khẩn cấp bảo vệ tài khoản khách hàng.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleBackup} disabled={loading} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {loading ? "..." : <><span className="text-xl">💾</span> BACKUP</>}
          </button>
          <button onClick={handleEmergencyStop} disabled={loading} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {loading ? "..." : <><span className="text-xl">🛑</span> PAUSE</>}
          </button>
          <button onClick={handleRestore} disabled={loading} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
             {loading ? "..." : <><RefreshCw size={20}/> RESUME</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ COMPONENT THẺ RÚT TIỀN CỦA ADMIN (CÓ MODAL THANH TOÁN QR)
const AdminWithdrawCard = ({ targetUser, adminUser, onComplete }: { targetUser: any, adminUser: any, onComplete: () => void }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false); 
    
    const amountUSD = targetUser.wallet?.pending || 0;
    const amountVND = Math.round(amountUSD * 25500);
    const isBank = !!targetUser.bankInfo?.accountNumber;

    // 🟢 DUYỆT LỆNH (Gọi API sau khi xác nhận chuyển khoản)
    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            const token = await adminUser.getIdToken();
            const res = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userId: targetUser.id, amount: amountUSD, action: 'approve' }),
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Đã ghi nhận thanh toán thành công!");
                setShowCheckoutModal(false);
                onComplete(); 
            } else { alert("❌ Thất bại: " + data.message); }
        } catch (e) { alert("❌ Lỗi Server!"); } 
        finally { setIsProcessing(false); }
    };

    // 🔴 TỪ CHỐI / HOÀN TIỀN LẠI CHO LÍNH
    const handleReject = async () => {
        const reason = prompt("Lý do từ chối (Hoàn tiền lại cho lính)?");
        if (reason === null) return; 
        
        setIsProcessing(true);
        try {
            const token = await adminUser.getIdToken();
            const res = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                // ✅ ĐÃ BƠM BIẾN AMOUNT VÀO ĐỂ VƯỢT QUA ZOD/BACKEND VALIDATION
                body: JSON.stringify({ 
                    userId: targetUser.id, 
                    action: 'cancel_by_admin', 
                    reason: reason,
                    amount: amountUSD 
                }),
            });
            
            const data = await res.json();

            if (res.ok && data.success) {
                alert("✅ Đã hủy lệnh và hoàn tiền lại vào ví khả dụng!");
                onComplete();
            } else { 
                alert("❌ Lỗi từ Server: " + (data.message || "Không xác định")); 
            }
        } catch (e: any) { 
            console.error("Lỗi Hủy Lệnh:", e);
            alert("❌ Lỗi Mạng hoặc Code: " + e.message); 
        } 
        finally { setIsProcessing(false); }
    };

    return (
        <>
            {/* THẺ BÊN NGOÀI */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-white">{targetUser.displayName}</p>
                        <p className="text-xs text-slate-500">{targetUser.email}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-yellow-400 font-mono">${amountUSD.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-black/40 p-3 rounded border border-slate-700 text-xs font-mono">
                    {isBank ? (
                        <>
                            <div className="flex items-center gap-2 text-blue-400 mb-1"><CreditCard size={12}/> {targetUser.bankInfo.bankName}</div>
                            <div className="text-lg font-bold text-white select-all">{targetUser.bankInfo.accountNumber}</div>
                            <div className="text-slate-400 uppercase">{targetUser.bankInfo.accountHolder}</div>
                        </>
                    ) : targetUser.cryptoInfo?.walletAddress ? (
                        <>
                            <div className="flex items-center gap-2 text-yellow-500 mb-1"><Bitcoin size={12}/> {targetUser.cryptoInfo.network}</div>
                            <div className="break-all select-all text-white">{targetUser.cryptoInfo.walletAddress}</div>
                        </>
                    ) : <div className="text-red-500 italic">Chưa có thông tin nhận tiền!</div>}
                </div>

                <div className="flex gap-2 pt-2">
                    <button 
                        onClick={() => setShowCheckoutModal(true)} 
                        disabled={isProcessing} 
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                        <QrCode size={16}/> THANH TOÁN (PAID)
                    </button>
                    <button onClick={handleReject} disabled={isProcessing} className="px-4 py-2.5 text-xs font-bold text-red-400 bg-red-900/20 border border-red-500/30 hover:bg-red-600 hover:text-white rounded flex justify-center items-center transition-all">
                        <XCircle size={16}/> HỦY
                    </button>
                </div>
            </div>

            {/* MODAL CHECKOUT (QR CODE TO RÕ) */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-blue-500/50 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative flex flex-col items-center">
                        <button onClick={() => setShowCheckoutModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <XCircle size={24}/>
                        </button>
                        
                        <h3 className="text-xl font-black text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                            <ShieldAlert size={20}/> THI HÀNH LỆNH
                        </h3>

                        {isBank ? (
                            <>
                                {/* HÌNH ẢNH QR CODE LỚN */}
                                <div className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6 w-56 h-56 flex items-center justify-center relative group">
                                    <img 
                                        src={`https://img.vietqr.io/image/${getVietQRBankCode(targetUser.bankInfo.bankName)}-${targetUser.bankInfo.accountNumber}-compact2.png?amount=${amountVND}&addInfo=Thanh toan hoa hong Spartan&accountName=${targetUser.bankInfo.accountHolder}`} 
                                        alt="VietQR" 
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl animate-pulse pointer-events-none"></div>
                                </div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><ScanLine size={14}/> QUÉT ĐỂ CHUYỂN NGAY</p>
                            </>
                        ) : (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl mb-6 w-full text-center">
                                <Bitcoin size={48} className="text-yellow-500 mx-auto mb-3 animate-bounce"/>
                                <p className="text-yellow-500 font-bold uppercase text-xs mb-1">Chuyển Crypto Qua Mạng</p>
                                <p className="text-white font-black">{targetUser.cryptoInfo?.network}</p>
                            </div>
                        )}

                        {/* BẢNG TÓM TẮT TÀI CHÍNH */}
                        <div className="w-full space-y-3 text-sm font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                            <div className="flex justify-between items-center"><span className="text-slate-500">Mục tiêu:</span><span className="text-white font-bold">{targetUser.email}</span></div>
                            {isBank && (
                                <>
                                    <div className="flex justify-between items-center"><span className="text-slate-500">STK:</span><span className="text-blue-400 font-bold select-all">{targetUser.bankInfo.accountNumber}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-slate-500">Tên:</span><span className="text-white font-bold uppercase truncate max-w-[150px]">{targetUser.bankInfo.accountHolder}</span></div>
                                </>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-slate-800"><span className="text-slate-500">Hoa hồng (USD):</span><span className="text-yellow-500 font-black text-lg">${amountUSD.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-500">Quy đổi (VNĐ):</span><span className="text-green-400 font-black text-xl">{amountVND.toLocaleString('vi-VN')} đ</span></div>
                        </div>

                        {/* NÚT BẤM XÁC NHẬN */}
                        <button 
                            onClick={handleApprove} 
                            disabled={isProcessing} 
                            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl uppercase tracking-widest flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-95"
                        >
                            {isProcessing ? "ĐANG XỬ LÝ..." : <><CheckCircle size={20}/> TÔI ĐÃ CHUYỂN TIỀN</>}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default function AdminPage() {
  const { isAdmin, user: adminUser } = useAuth(); 
  
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
  const updateUserSoldier = async (userId: string, currentExpiry: any, days: number, plan: string) => {
    if(!confirm(`Xác nhận nâng cấp gói ${plan.toUpperCase()}?`)) return;

    let newDateStr;
    if (plan === 'LIFETIME') {
        newDateStr = "2099-12-31T23:59:59.000Z";
    } else {
        const now = Date.now();
        const expiryMillis = currentExpiry ? currentExpiry.seconds * 1000 : 0;
        const baseDate = (expiryMillis > now) ? new Date(expiryMillis) : new Date();
        baseDate.setDate(baseDate.getDate() + days);
        newDateStr = baseDate.toISOString();
    }

    try {
        if (!adminUser) return alert("❌ Lỗi: Bạn chưa đăng nhập quyền Admin!");
        const token = await adminUser.getIdToken(); 

        const res = await fetch('/api/admin/update-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userId, newExpiryDate: newDateStr, newPlan: plan, daysAdded: days })
        });

        const data = await res.json();
        if (data.success) {
            alert(data.message);
            fetchUsers(); 
        } else { alert("❌ Lỗi: " + data.error); }
    } catch (e) { alert("❌ Lỗi kết nối Server!"); }
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

  const resetMT5 = async (userId: string) => {
    if(!confirm("Reset MT5 ID?")) return;
    await updateDoc(doc(db, "users", userId), { mt5Account: "" });
    fetchUsers();
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
        
        {/* 🔥 TÍCH HỢP BẢNG ĐIỀU KHIỂN KHẨN CẤP (CHỈ ADMIN MỚI THẤY) */}
        {isAdmin && <EmergencyPanel onRefresh={fetchUsers} adminUser={adminUser} />}

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
                        
                        {withdrawRequests.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 italic">Không có yêu cầu rút tiền nào đang chờ.</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {withdrawRequests.map(req => (
                                    <AdminWithdrawCard 
                                      key={req.id} 
                                      targetUser={req} 
                                      adminUser={adminUser} 
                                      onComplete={fetchUsers} 
                                    />
                                ))}
                            </div>
                        )}
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
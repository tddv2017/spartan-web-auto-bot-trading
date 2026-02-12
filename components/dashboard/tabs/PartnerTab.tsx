"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase'; 
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore'; 
import { ShieldCheck, Globe, Wallet, CheckCircle, Settings, Bitcoin, CreditCard, Clock, UserPlus, Share2, FileText, Check, Copy, Calendar, ArrowUpRight } from 'lucide-react';

const VN_BANKS = ["Vietcombank (VCB)", "MBBank (Quân Đội)", "Techcombank (TCB)", "ACB (Á Châu)", "VietinBank (CTG)", "BIDV (Đầu tư & PT)", "VPBank", "TPBank", "Sacombank", "VIB", "HDBank", "MSB", "OCB", "SHB", "Eximbank", "SeABank", "ABBank", "Nam A Bank", "Agribank"];

export const PartnerTab = ({ wallet, profile, user }: any) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAd, setCopiedAd] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'bank' | 'crypto'>('bank');
  const [bankInfo, setBankInfo] = useState({ bankName: "", accountNumber: "", accountHolder: "" });
  const [cryptoInfo, setCryptoInfo] = useState({ network: "USDT (TRC20)", walletAddress: "" });
  
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const refLink = `https://spartan-web-auto-bot-trading.vercel.app/?ref=${profile?.licenseKey}`;
  const adText = `🔥 SPARTAN BOT V7.3 - CỖ MÁY IN TIỀN XAUUSD 🔥\n✅ Lợi nhuận 15-30%/tháng\n✅ Tự động 100%, Không gồng lỗ\n✅ Bảo hiểm vốn 100%\n👉 Nhận Bot miễn phí tại: ${refLink}`;

  const { monthlyCommission, currentMonthLabel } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const total = profile?.referrals?.reduce((sum: number, item: any) => {
        if (!item.date || item.status !== 'approved') return sum;
        const itemDate = new Date(item.date);
        if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
            return sum + (item.commission || 0);
        }
        return sum;
    }, 0) || 0;

    return { monthlyCommission: total, currentMonthLabel: `Tháng ${currentMonth + 1}/${currentYear}` };
  }, [profile?.referrals]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.bankInfo) setBankInfo(data.bankInfo);
        if (data.cryptoInfo) {
            setCryptoInfo(data.cryptoInfo);
            if (!data.bankInfo?.accountNumber && data.cryptoInfo?.walletAddress) setActiveTab('crypto');
        }
      }
    };
    fetchData();
  }, [user]);

  const savePaymentInfo = async () => {
    try {
        const userRef = doc(db, "users", user.uid);
        if (activeTab === 'bank') {
            if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) { alert("⚠️ Vui lòng điền đủ thông tin!"); return; }
            await updateDoc(userRef, { bankInfo: bankInfo, cryptoInfo: deleteField() });
            alert("✅ Đã lưu thông tin Ngân hàng!");
        } else {
            if (!cryptoInfo.walletAddress) { alert("⚠️ Vui lòng nhập địa chỉ ví!"); return; }
            await updateDoc(userRef, { cryptoInfo: cryptoInfo, bankInfo: deleteField() });
            alert("✅ Đã lưu thông tin ví Crypto!");
        }
        setShowSettingsModal(false);
    } catch (error) { console.error(error); alert("❌ Lỗi hệ thống, thử lại sau."); }
  };

  // 🔥 YÊU CẦU RÚT TIỀN (LÍNH CHỈ ĐƯỢC PHÉP REQUEST)
  const handleRequestWithdraw = async () => {
    if (!profile?.bankInfo && !profile?.cryptoInfo) {
        alert("⚠️ Vui lòng cập nhật Ví nhận tiền (Nút cài đặt) trước!"); return;
    }
    const amountStr = prompt(`Nhập số tiền muốn rút (Tối đa: $${wallet?.available?.toFixed(2) || 0}):`); 
    if (!amountStr) return;
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) { alert("⚠️ Số tiền không hợp lệ"); return; }
    if (amount < 10) { alert("⚠️ Số tiền rút tối thiểu là $10"); return; }
    if (amount > wallet.available) { alert("⚠️ Số dư không đủ!"); return; }

    if(!confirm(`Xác nhận rút $${amount} về ví của bạn?`)) return;

    setIsWithdrawing(true);
    try {
        const token = await user.getIdToken();
        const res = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ email: user.email, amount: amount, action: 'request' }),
        });
        const data = await res.json();
        if (data.success) alert(data.message);
        else alert("❌ Thất bại: " + data.message);
    } catch (e) { alert("❌ Lỗi kết nối server!"); } 
    finally { setIsWithdrawing(false); }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 mt-6 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-yellow-500" /> SPARTAN AGENCY
            </h2>
            <p className="text-sm text-slate-400 mt-1">Cấp bậc: <span className="text-yellow-500 font-bold">COMMANDER (40% Hoa hồng)</span></p>
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-3">
            <Globe size={16} className="text-green-500"/>
            <span className="text-xs text-slate-400">Mã giới thiệu:</span>
            <span className="text-sm font-mono font-bold text-white select-all">{profile?.licenseKey}</span>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* CỘT 1: SỐ DƯ */}
          <div className="md:col-span-2 bg-gradient-to-br from-green-900/40 to-slate-900 border border-green-500/50 p-6 rounded-[2rem] relative overflow-hidden group hover:border-green-400 transition-colors flex flex-col">
              <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet size={100}/></div>
              <div className="flex justify-between items-start mb-2 relative z-10"><p className="text-[10px] text-green-400 font-black uppercase flex items-center gap-2 tracking-widest"><CheckCircle size={12}/> Số dư khả dụng</p><button onClick={() => setShowSettingsModal(true)} className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800"><Settings size={16} /></button></div>
              <h2 className="text-5xl font-black text-white font-chakra mb-2 relative z-10">${(wallet?.available || 0).toFixed(2)}</h2>
              <div className="relative z-10 min-h-[20px] mb-6">
                  {profile?.cryptoInfo?.walletAddress ? (<p className="text-[10px] text-green-400 font-mono truncate flex items-center gap-1"><Bitcoin size={12} /> {profile.cryptoInfo.network}: {profile.cryptoInfo.walletAddress.substring(0, 6)}...{profile.cryptoInfo.walletAddress.slice(-4)}</p>) : 
                   profile?.bankInfo?.accountNumber ? (<p className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1"><CreditCard size={12} /> {profile.bankInfo.bankName.split('(')[0]} • {profile.bankInfo.accountNumber}</p>) : 
                   (<p className="text-[10px] text-red-500 italic animate-pulse">⚠ Chưa cài đặt ví nhận tiền</p>)}
              </div>
              <button 
                onClick={handleRequestWithdraw} 
                disabled={isWithdrawing || (wallet?.pending > 0)} 
                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-green-900/50 active:scale-95 transition-all mt-auto relative z-10 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                 {isWithdrawing ? "ĐANG GỬI YÊU CẦU..." : <><ArrowUpRight size={18}/> RÚT TIỀN NGAY</>}
              </button>
          </div>

          {/* CỘT 2: LỆNH ĐANG CHỜ (ĐÃ GỠ QR VÀ NÚT HỦY) */}
          <div className={`bg-slate-900/60 border p-6 rounded-[2rem] flex flex-col justify-center relative overflow-hidden ${wallet?.pending > 0 ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-slate-800'}`}>
              <p className="text-[10px] text-yellow-500 font-black uppercase mb-2 flex items-center gap-2 tracking-widest"><Clock size={12}/> Đang xử lý</p>
              <h2 className={`text-3xl font-black font-chakra mb-2 ${wallet?.pending > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>${(wallet?.pending || 0).toFixed(2)}</h2>
              {wallet?.pending > 0 ? (
                  <div className="bg-yellow-500/10 text-yellow-500 text-[10px] p-2 rounded border border-yellow-500/20 text-center animate-pulse mt-2">
                      ⏳ Yêu cầu đang được Admin chờ duyệt...
                  </div>
              ) : (
                  <p className="text-[10px] text-slate-500 italic mt-auto">Không có lệnh đang chờ.</p>
              )}
          </div>

          {/* CỘT 3: TỔNG ĐÃ RÚT */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-center">
              <p className="text-[10px] text-blue-400 font-black uppercase mb-2 flex items-center gap-2 tracking-widest"><CheckCircle size={12}/> Tổng đã rút</p>
              <h2 className="text-3xl font-black text-white font-chakra mb-2">${(wallet?.total_paid || 0).toFixed(2)}</h2>
              <p className="text-[10px] text-slate-500 mt-auto">Tiền đã về tài khoản của bạn.</p>
          </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-3">
               <div className="p-3 bg-slate-800 rounded-lg text-purple-400"><Calendar size={20}/></div>
               <div>
                   <p className="text-xs text-slate-400 font-bold uppercase">Doanh số {currentMonthLabel}</p>
                   <p className="text-xl font-black text-white">+${monthlyCommission.toFixed(2)}</p>
               </div>
           </div>
           <div className="text-right">
                <p className="text-xs text-slate-500">F1 Mới</p>
                <p className="text-xl font-bold text-green-500">
                    {profile?.referrals?.filter((r:any) => {
                        const d = new Date(r.date); const now = new Date();
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }).length || 0}
                </p>
           </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase"><Share2 size={16} className="text-blue-500"/> Link Giới thiệu</h3>
            <div className="bg-black/50 p-3 rounded-xl border border-slate-700 flex items-center gap-2 mb-3"><span className="text-xs text-slate-400 truncate flex-1 font-mono select-all">{refLink}</span><button onClick={() => { navigator.clipboard.writeText(refLink); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }} className="p-2 bg-slate-800 rounded text-white">{copiedLink ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}</button></div>
         </div>
         <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase"><FileText size={16} className="text-purple-500"/> Content Mẫu</h3>
            <div className="bg-black/50 p-3 rounded-xl border border-slate-700 relative group h-24 overflow-hidden">
               <p className="text-[10px] text-slate-300 whitespace-pre-line font-mono">{adText}</p>
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { navigator.clipboard.writeText(adText); setCopiedAd(true); setTimeout(() => setCopiedAd(false), 2000); }} className="text-xs bg-purple-600 text-white px-3 py-1 rounded font-bold">Sao chép</button></div>
            </div>
         </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-6 md:p-8">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-slate-800 pb-4">
              <UserPlus size={18} className="text-green-500"/> NHẬT KÝ TUYỂN DỤNG
          </h3>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-400">
                  <thead className="text-slate-500 uppercase font-black text-xs bg-slate-950/50">
                      <tr><th className="px-4 py-3 rounded-l-lg">Thành viên (F1)</th><th className="px-4 py-3">Ngày tham gia</th><th className="px-4 py-3">Gói</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right rounded-r-lg">Hoa hồng</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {profile?.referrals && profile.referrals.length > 0 ? (
                          [...profile.referrals].reverse().map((ref: any, index: number) => (
                              <tr key={index} className="hover:bg-slate-800/30 transition-colors"><td className="px-4 py-4 font-bold text-white truncate max-w-[150px]">{ref.email ? `${ref.email.split('@')[0]}***@${ref.email.split('@')[1]}` : 'Ẩn danh'}</td><td className="px-4 py-4 text-xs font-mono">{ref.date ? new Date(ref.date).toLocaleDateString('vi-VN') : 'N/A'}</td><td className="px-4 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${ref.plan === 'LIFETIME' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-700 text-slate-300'}`}>{ref.plan || 'TRIAL'}</span></td><td className="px-4 py-4">{ref.status === 'approved' ? (<span className="flex items-center gap-1 text-green-500 text-xs font-bold"><CheckCircle size={12}/> Active</span>) : (<span className="flex items-center gap-1 text-yellow-500 text-xs font-bold"><Clock size={12}/> Pending</span>)}</td><td className="px-4 py-4 text-right font-mono font-bold text-green-400">+${(ref.commission || 0).toFixed(2)}</td></tr>
                          ))
                      ) : (
                          <tr><td colSpan={5} className="text-center py-8 text-slate-500 italic">Chưa có thành viên nào. Hãy chia sẻ link giới thiệu ngay!</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
      
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6"><Settings className="text-green-500" /> CÀI ĐẶT VÍ</h3>
            <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
                <button onClick={() => setActiveTab('bank')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${activeTab === 'bank' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Ngân hàng</button>
                <button onClick={() => setActiveTab('crypto')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${activeTab === 'crypto' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>Crypto</button>
            </div>
            <div className="space-y-4">
                {activeTab === 'bank' ? (
                    <><select value={bankInfo.bankName} onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"><option value="" disabled>-- Chọn ngân hàng --</option>{VN_BANKS.map((bank, idx) => <option key={idx} value={bank}>{bank}</option>)}</select><input type="text" value={bankInfo.accountNumber} onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})} placeholder="Số tài khoản" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" /><input type="text" value={bankInfo.accountHolder} onChange={(e) => setBankInfo({...bankInfo, accountHolder: e.target.value.toUpperCase()})} placeholder="Tên chủ tài khoản" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white uppercase outline-none" /></>
                ) : ( <input type="text" value={cryptoInfo.walletAddress} onChange={(e) => setCryptoInfo({...cryptoInfo, walletAddress: e.target.value})} placeholder="Địa chỉ ví TRC20" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs outline-none" /> )}
            </div>
            <div className="mt-8 flex gap-3"><button onClick={() => setShowSettingsModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800">Hủy</button><button onClick={savePaymentInfo} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">LƯU</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
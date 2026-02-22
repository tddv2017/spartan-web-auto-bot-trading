"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase'; 
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore'; 
import { ShieldCheck, Globe, Wallet, CheckCircle2, Settings, Bitcoin, CreditCard, Clock, UserPlus, Share2, FileText, Check, Copy, Calendar, ArrowUpRight } from 'lucide-react';

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
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Agency */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                <ShieldCheck className="text-amber-500" size={24} /> SPARTAN AGENCY
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Cấp bậc: <span className="text-amber-500">COMMANDER (Hoa hồng tối đa)</span></p>
          </div>
          <div className="bg-[#0B1120] px-4 py-2.5 rounded-xl border border-slate-700/60 flex items-center gap-3">
            <Globe size={16} className="text-blue-500"/>
            <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Mã Giới Thiệu:</span>
            <span className="text-sm font-mono font-bold text-white select-all">{profile?.licenseKey}</span>
          </div>
      </div>
      
      {/* Wallet Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* CỘT 1: SỐ DƯ */}
          <div className="xl:col-span-2 bg-[#111827] border border-slate-800 p-6 rounded-2xl relative overflow-hidden flex flex-col shadow-sm">
              <div className="absolute right-0 top-0 p-6 opacity-5 pointer-events-none"><Wallet size={120}/></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                  <p className="text-[11px] text-emerald-500 font-bold uppercase flex items-center gap-1.5 tracking-wider"><CheckCircle2 size={14}/> SỐ DƯ KHẢ DỤNG</p>
                  <button onClick={() => setShowSettingsModal(true)} className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg hover:bg-slate-700" title="Cài đặt ví nhận tiền"><Settings size={16} /></button>
              </div>
              
              <h2 className="text-5xl font-black text-white font-mono mb-4 relative z-10 tracking-tight">${(wallet?.available || 0).toFixed(2)}</h2>
              
              <div className="relative z-10 min-h-[30px] mb-6">
                  {profile?.cryptoInfo?.walletAddress ? (
                      <div className="bg-[#0B1120] p-2.5 rounded-lg border border-slate-800 inline-flex items-center gap-2">
                          <Bitcoin size={14} className="text-amber-500"/>
                          <span className="text-[11px] text-slate-400 font-semibold">{profile.cryptoInfo.network}:</span>
                          <span className="text-xs text-white font-mono truncate max-w-[150px]">{profile.cryptoInfo.walletAddress}</span>
                      </div>
                  ) : profile?.bankInfo?.accountNumber ? (
                      <div className="bg-[#0B1120] p-2.5 rounded-lg border border-slate-800 inline-flex items-center gap-2">
                          <CreditCard size={14} className="text-blue-500"/>
                          <span className="text-[11px] text-slate-400 font-semibold">{profile.bankInfo.bankName.split('(')[0]}:</span>
                          <span className="text-xs text-white font-mono">{profile.bankInfo.accountNumber}</span>
                      </div>
                  ) : (
                      <p className="text-[11px] text-red-400 italic bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/20 inline-block animate-pulse">⚠ Vui lòng cài đặt phương thức nhận tiền</p>
                  )}
              </div>
              
              <button 
                onClick={handleRequestWithdraw} 
                disabled={isWithdrawing || (wallet?.pending > 0)} 
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-colors mt-auto relative z-10 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                 {isWithdrawing ? "ĐANG XỬ LÝ..." : <><ArrowUpRight size={18}/> YÊU CẦU RÚT TIỀN</>}
              </button>
          </div>

          {/* CỘT 2: PENDING & TOTAL */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex flex-col shadow-sm">
                  <p className="text-[11px] text-amber-500 font-bold uppercase mb-3 flex items-center gap-1.5 tracking-wider"><Clock size={14}/> ĐANG CHỜ DUYỆT</p>
                  <h2 className="text-3xl font-black font-mono mb-2 text-white">${(wallet?.pending || 0).toFixed(2)}</h2>
                  <div className="mt-auto">
                      {wallet?.pending > 0 ? (
                          <div className="bg-amber-500/10 text-amber-500 text-[10px] font-semibold px-3 py-2 rounded-lg border border-amber-500/20">
                              Lệnh đang được Admin xử lý...
                          </div>
                      ) : (
                          <p className="text-[11px] text-slate-500">Không có yêu cầu rút tiền.</p>
                      )}
                  </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex flex-col shadow-sm">
                  <p className="text-[11px] text-blue-500 font-bold uppercase mb-3 flex items-center gap-1.5 tracking-wider"><Wallet size={14}/> TỔNG ĐÃ RÚT</p>
                  <h2 className="text-3xl font-black text-white font-mono mb-2">${(wallet?.total_paid || 0).toFixed(2)}</h2>
                  <p className="text-[11px] text-slate-500 mt-auto">Tổng số tiền đã nhận thành công.</p>
              </div>

              <div className="md:col-span-2 bg-[#111827] border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#0B1120] border border-slate-700/60 rounded-xl text-purple-500"><Calendar size={20}/></div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Doanh Số {currentMonthLabel}</p>
                        <p className="text-xl font-bold text-white font-mono">+${monthlyCommission.toFixed(2)}</p>
                    </div>
                </div>
                <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">F1 Tháng Này</p>
                        <p className="text-xl font-bold text-emerald-500 font-mono">
                            {profile?.referrals?.filter((r:any) => {
                                const d = new Date(r.date); const now = new Date();
                                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                            }).length || 0}
                        </p>
                </div>
              </div>
          </div>
      </div>

      {/* Marketing Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide"><Share2 size={16} className="text-blue-500"/> Link Giới Thiệu</h3>
            <div className="bg-[#0B1120] p-2 pl-4 rounded-xl border border-slate-700/60 flex items-center gap-3">
                <span className="text-xs text-slate-400 truncate flex-1 font-mono select-all">{refLink}</span>
                <button onClick={() => { navigator.clipboard.writeText(refLink); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors text-xs font-bold flex items-center gap-1.5">
                    {copiedLink ? <><Check size={14} className="text-emerald-500"/> ĐÃ COPY</> : "SAO CHÉP"}
                </button>
            </div>
         </div>
         <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide"><FileText size={16} className="text-purple-500"/> Nội Dung Mẫu (Marketing)</h3>
            <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-700/60 relative group h-28 overflow-hidden">
               <p className="text-[11px] text-slate-400 whitespace-pre-line font-mono leading-relaxed">{adText}</p>
               <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-transparent flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { navigator.clipboard.writeText(adText); setCopiedAd(true); setTimeout(() => setCopiedAd(false), 2000); }} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg font-bold transition-colors">
                       Sao chép nội dung
                   </button>
                </div>
            </div>
         </div>
      </div>

      {/* Referral Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/30">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider text-sm">
                <UserPlus size={18} className="text-emerald-500"/> MẠNG LƯỚI F1 TRỰC TIẾP
            </h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="text-slate-400 uppercase font-bold text-[11px] bg-[#0B1120] border-b border-slate-800 tracking-wider">
                      <tr><th className="px-6 py-4">Tài khoản F1</th><th className="px-6 py-4">Ngày tham gia</th><th className="px-6 py-4 text-center">Gói cước</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4 text-right">Hoa hồng nhận</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                      {profile?.referrals && profile.referrals.length > 0 ? (
                          [...profile.referrals].reverse().map((ref: any, index: number) => (
                              <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="px-6 py-4 font-bold text-white">{ref.email ? `${ref.email.split('@')[0]}***@${ref.email.split('@')[1]}` : 'Ẩn danh'}</td>
                                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{ref.date ? new Date(ref.date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                  <td className="px-6 py-4 text-center"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${ref.plan === 'LIFETIME' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-800/50 text-slate-400 border-slate-700'}`}>{ref.plan || 'TRIAL'}</span></td>
                                  <td className="px-6 py-4">{ref.status === 'approved' ? (<span className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-bold uppercase"><CheckCircle2 size={14}/> Active</span>) : (<span className="flex items-center gap-1.5 text-amber-500 text-[11px] font-bold uppercase"><Clock size={14}/> Pending</span>)}</td>
                                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">+${(ref.commission || 0).toFixed(2)}</td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan={5} className="text-center py-12 text-slate-500 text-sm italic">Chưa có thành viên nào tham gia qua link của bạn.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-[#0B1120]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5 mb-6 uppercase tracking-wider"><Settings className="text-blue-500" size={20} /> CÀI ĐẶT THANH TOÁN</h3>
            
            <div className="flex bg-[#0B1120] p-1.5 rounded-xl mb-6 border border-slate-800">
                <button onClick={() => setActiveTab('bank')} className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'bank' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>Ngân hàng (VNĐ)</button>
                <button onClick={() => setActiveTab('crypto')} className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'crypto' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>Crypto (USDT)</button>
            </div>
            
            <div className="space-y-4">
                {activeTab === 'bank' ? (
                    <>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider ml-1">Chọn Ngân Hàng</label>
                            <select value={bankInfo.bankName} onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})} className="w-full bg-[#0B1120] border border-slate-700 focus:border-blue-500 rounded-xl p-3.5 text-sm text-white outline-none appearance-none cursor-pointer"><option value="" disabled>-- Vui lòng chọn --</option>{VN_BANKS.map((bank, idx) => <option key={idx} value={bank}>{bank}</option>)}</select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider ml-1">Số Tài Khoản</label>
                            <input type="text" value={bankInfo.accountNumber} onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})} placeholder="Ví dụ: 1903..." className="w-full bg-[#0B1120] border border-slate-700 focus:border-blue-500 rounded-xl p-3.5 text-sm text-white outline-none font-mono" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider ml-1">Tên Chủ Tài Khoản</label>
                            <input type="text" value={bankInfo.accountHolder} onChange={(e) => setBankInfo({...bankInfo, accountHolder: e.target.value.toUpperCase()})} placeholder="NGUYEN VAN A" className="w-full bg-[#0B1120] border border-slate-700 focus:border-blue-500 rounded-xl p-3.5 text-sm text-white uppercase outline-none" />
                        </div>
                    </>
                ) : ( 
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider ml-1">Địa chỉ ví USDT (TRC20)</label>
                        <input type="text" value={cryptoInfo.walletAddress} onChange={(e) => setCryptoInfo({...cryptoInfo, walletAddress: e.target.value})} placeholder="Tx..." className="w-full bg-[#0B1120] border border-slate-700 focus:border-blue-500 rounded-xl p-3.5 text-sm text-white font-mono outline-none" />
                    </div>
                )}
            </div>
            
            <div className="mt-8 flex gap-3">
                <button onClick={() => setShowSettingsModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 bg-slate-800/50 hover:bg-slate-800 text-sm transition-colors">HỦY BỎ</button>
                <button onClick={savePaymentInfo} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm">LƯU CÀI ĐẶT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
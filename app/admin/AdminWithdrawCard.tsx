import React, { useState } from 'react';
import { CreditCard, Bitcoin, ShieldAlert, CheckCircle, XCircle, QrCode, Loader2 } from 'lucide-react';
import { getVietQRBankCode } from '@/app/admin/utils/adminHelpers';
import { ScanLine } from './SharedComponents';

export const AdminWithdrawCard = ({ targetUser, adminUser, onComplete }: { targetUser: any, adminUser: any, onComplete: () => void }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false); 
    
    const amountUSD = Number(targetUser.wallet?.pending || 0);
    const amountVND = Math.round(amountUSD * 25500);
    const isBank = !!targetUser.bankInfo?.accountNumber;

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
                setShowCheckoutModal(false);
                onComplete(); 
            } else { alert("❌ Thất bại: " + data.message); }
        } catch (e) { alert("❌ Lỗi Server!"); } 
        finally { setIsProcessing(false); }
    };

    const handleReject = async () => {
        const reason = prompt("Lý do từ chối (Hoàn tiền lại cho lính)?");
        if (reason === null) return; 
        
        setIsProcessing(true);
        try {
            const token = await adminUser.getIdToken();
            const res = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userId: targetUser.id, action: 'cancel_by_admin', reason: reason, amount: amountUSD }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                onComplete();
            } else { alert("❌ Lỗi: " + (data.message || "Không xác định")); }
        } catch (e: any) { alert("❌ Lỗi Mạng!"); } 
        finally { setIsProcessing(false); }
    };

    return (
        <>
            {/* THẺ RÚT TIỀN (TAILADMIN STYLE) */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-lg tracking-tight">{targetUser.displayName}</span>
                        <span className="text-xs text-slate-500">{targetUser.email}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Cần thanh toán</span>
                        <span className="text-2xl font-bold text-amber-400 font-mono tracking-tight">${amountUSD.toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800/60 text-sm font-mono">
                    {isBank ? (
                        <>
                            <div className="flex items-center gap-2 text-blue-400 mb-2 font-sans font-semibold text-xs uppercase tracking-wider"><CreditCard size={14}/> {targetUser.bankInfo.bankName}</div>
                            <div className="text-lg font-bold text-white select-all mb-1">{targetUser.bankInfo.accountNumber}</div>
                            <div className="text-slate-400 uppercase text-xs">{targetUser.bankInfo.accountHolder}</div>
                        </>
                    ) : targetUser.cryptoInfo?.walletAddress ? (
                        <>
                            <div className="flex items-center gap-2 text-amber-500 mb-2 font-sans font-semibold text-xs uppercase tracking-wider"><Bitcoin size={14}/> {targetUser.cryptoInfo.network}</div>
                            <div className="break-all select-all text-slate-300 text-xs leading-relaxed">{targetUser.cryptoInfo.walletAddress}</div>
                        </>
                    ) : <div className="text-red-500 italic text-sm font-sans">Chưa có thông tin nhận tiền!</div>}
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowCheckoutModal(true)} disabled={isProcessing} className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex justify-center items-center gap-2 transition-all shadow-sm">
                        <QrCode size={16}/> DUYỆT LỆNH
                    </button>
                    <button onClick={handleReject} disabled={isProcessing} className="px-4 py-2.5 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-red-500 hover:text-white rounded-lg flex justify-center items-center transition-all">
                        HỦY BỎ
                    </button>
                </div>
            </div>

            {/* MODAL CHECKOUT */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-[#0B1120]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-sm p-8 shadow-2xl relative flex flex-col items-center">
                        <button onClick={() => setShowCheckoutModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"><XCircle size={20}/></button>
                        
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide"><ShieldAlert size={18} className="text-blue-500"/> XÁC NHẬN THANH TOÁN</h3>

                        {isBank ? (
                            <>
                                <div className="bg-white p-2 rounded-xl shadow-lg mb-6 w-52 h-52 flex items-center justify-center relative">
                                    <img src={`https://img.vietqr.io/image/${getVietQRBankCode(targetUser.bankInfo.bankName)}-${targetUser.bankInfo.accountNumber}-compact2.png?amount=${amountVND}&addInfo=Thanh toan hoa hong Spartan&accountName=${targetUser.bankInfo.accountHolder}`} alt="VietQR" className="w-full h-full object-contain rounded-lg"/>
                                </div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><ScanLine size={14}/> QUÉT QR ĐỂ CHUYỂN KHOẢN</p>
                            </>
                        ) : (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-xl mb-6 w-full text-center">
                                <Bitcoin size={40} className="text-amber-500 mx-auto mb-4"/>
                                <p className="text-amber-500 font-semibold uppercase text-xs tracking-wider mb-1">Chuyển Crypto Qua Mạng</p>
                                <p className="text-white font-bold">{targetUser.cryptoInfo?.network}</p>
                            </div>
                        )}

                        <div className="w-full space-y-4 text-sm bg-[#0B1120] p-5 rounded-xl border border-slate-800/60 mb-8">
                            <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Chiến binh:</span><span className="text-white font-semibold">{targetUser.displayName}</span></div>
                            <div className="flex justify-between items-center border-t border-slate-800/60 pt-4"><span className="text-slate-500 font-medium">Cần thanh toán:</span><span className="text-amber-400 font-bold font-mono text-lg">${amountUSD.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Quy đổi (VNĐ):</span><span className="text-emerald-400 font-bold font-mono text-lg">{amountVND.toLocaleString('vi-VN')} đ</span></div>
                        </div>

                        <button onClick={handleApprove} disabled={isProcessing} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider flex justify-center items-center gap-2 transition-all disabled:opacity-70">
                            {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <><CheckCircle size={18}/> ĐÃ CHUYỂN TIỀN</>}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
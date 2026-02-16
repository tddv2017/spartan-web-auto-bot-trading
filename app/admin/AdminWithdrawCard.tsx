import React, { useState } from 'react';
import { CreditCard, Bitcoin, ShieldAlert, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { getVietQRBankCode } from '@/app/admin/utils/adminHelpers';
import { ScanLine } from './SharedComponents';

export const AdminWithdrawCard = ({ targetUser, adminUser, onComplete }: { targetUser: any, adminUser: any, onComplete: () => void }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false); 
    
    const amountUSD = targetUser.wallet?.pending || 0;
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
                alert("✅ Đã ghi nhận thanh toán thành công!");
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
                alert("✅ Đã hủy lệnh và hoàn tiền lại vào ví khả dụng!");
                onComplete();
            } else { alert("❌ Lỗi từ Server: " + (data.message || "Không xác định")); }
        } catch (e: any) { alert("❌ Lỗi Mạng: " + e.message); } 
        finally { setIsProcessing(false); }
    };

    return (
        <>
            {/* THẺ RÚT TIỀN NHỎ BÊN NGOÀI */}
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
                    <button onClick={() => setShowCheckoutModal(true)} disabled={isProcessing} className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                        <QrCode size={16}/> THANH TOÁN (PAID)
                    </button>
                    <button onClick={handleReject} disabled={isProcessing} className="px-4 py-2.5 text-xs font-bold text-red-400 bg-red-900/20 border border-red-500/30 hover:bg-red-600 hover:text-white rounded flex justify-center items-center transition-all">
                        <XCircle size={16}/> HỦY
                    </button>
                </div>
            </div>

            {/* MODAL CHECKOUT */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-blue-500/50 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative flex flex-col items-center">
                        <button onClick={() => setShowCheckoutModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><XCircle size={24}/></button>
                        <h3 className="text-xl font-black text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-widest"><ShieldAlert size={20}/> THI HÀNH LỆNH</h3>

                        {isBank ? (
                            <>
                                <div className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6 w-56 h-56 flex items-center justify-center relative group">
                                    <img src={`https://img.vietqr.io/image/${getVietQRBankCode(targetUser.bankInfo.bankName)}-${targetUser.bankInfo.accountNumber}-compact2.png?amount=${amountVND}&addInfo=Thanh toan hoa hong Spartan&accountName=${targetUser.bankInfo.accountHolder}`} alt="VietQR" className="w-full h-full object-contain"/>
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

                        <div className="w-full space-y-3 text-sm font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                            <div className="flex justify-between items-center"><span className="text-slate-500">Mục tiêu:</span><span className="text-white font-bold">{targetUser.email}</span></div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-800"><span className="text-slate-500">Hoa hồng (USD):</span><span className="text-yellow-500 font-black text-lg">${amountUSD.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-500">Quy đổi (VNĐ):</span><span className="text-green-400 font-black text-xl">{amountVND.toLocaleString('vi-VN')} đ</span></div>
                        </div>

                        <button onClick={handleApprove} disabled={isProcessing} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl uppercase tracking-widest flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-95">
                            {isProcessing ? "ĐANG XỬ LÝ..." : <><CheckCircle size={20}/> TÔI ĐÃ CHUYỂN TIỀN</>}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
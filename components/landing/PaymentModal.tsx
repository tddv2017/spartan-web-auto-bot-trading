"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { Loader2, X, Shield, Star, Crown, CheckSquare, Square, Copy, Check, RefreshCw, CheckCircle, PartyPopper, Zap } from "lucide-react";
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Confetti from 'react-confetti';

const MY_USDT_WALLET = "TXWxf32YxYWZ99J7ZrvD3zBF8NPkPobKGG"; 
const BANK_INFO = { BANK_ID: "ACB", ACCOUNT_NO: "189362839", TEMPLATE: "PRINT", ACCOUNT_NAME: "LE QUOC DUNG" };

export default function PaymentModal({ isOpen, onClose, plan: initialPlan }: { isOpen: boolean; onClose: () => void; plan: string }) {
  const { profile, user } = useAuth();
  const { t, language } = useLanguage(); 
  const [currentPlan, setCurrentPlan] = useState(initialPlan || "yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentReady, setIsPaymentReady] = useState(false); 
  const [isUserConfirmed, setIsUserConfirmed] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(false); 
  const initialExpiryRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen || !user || !profile) return;
    if (initialExpiryRef.current === 0) initialExpiryRef.current = profile.expiryDate?.seconds || 0;

    // ⚡️ CHỈ LẮNG NGHE THAY ĐỔI ĐỂ KÍCH HOẠT NÚT (Dùng logic Code 1 ổn định)
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if ((data.expiryDate?.seconds || 0) > initialExpiryRef.current || data.plan !== profile.plan) {
          setIsPaymentReady(true); // Webhook đã bắn tiền thành công!
        }
      }
    });
    return () => unsub();
  }, [isOpen, user?.uid]);

  useEffect(() => { if (isPaymentReady && isUserConfirmed) setIsSuccess(true); }, [isPaymentReady, isUserConfirmed]);

  const handleConfirmPayment = () => {
      setIsUserConfirmed(true);
      if (!isPaymentReady) {
          setIsProcessing(true);
          setTimeout(() => setIsProcessing(false), 20000);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl">
      {isSuccess && <Confetti />}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
        {isSuccess ? (
          <div className="text-center py-10">
            <PartyPopper size={60} className="text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-black text-white italic">NẠP QUÂN LƯƠNG THÀNH CÔNG!</h2>
            <button onClick={() => window.location.reload()} className="mt-8 w-full bg-green-600 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"><Crown size={20}/> VÀO CHIẾN TRƯỜNG</button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-black text-white mb-6 uppercase italic">Quét mã nạp tiền</h2>
            <div className="bg-white p-4 rounded-3xl mb-6 shadow-lg">
                <img src={`https://img.vietqr.io/image/ACB-189362839-PRINT.png?amount=25500&addInfo=${profile?.licenseKey}%20${currentPlan.toUpperCase()}`} alt="QR" className="w-48 h-48" />
            </div>
            <button onClick={handleConfirmPayment} disabled={isProcessing && !isPaymentReady} className={`w-full py-4 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isPaymentReady ? "bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse text-white scale-105 border-2 border-white/20" : "bg-slate-800 text-slate-500"}`}>
               {isPaymentReady ? <><Zap size={24} className="fill-yellow-300 text-yellow-300 animate-bounce" /> XÁC NHẬN KÍCH HOẠT NGAY! </> : <>{isProcessing ? <Loader2 className="animate-spin" /> : "TÔI ĐÃ CHUYỂN KHOẢN XONG"}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
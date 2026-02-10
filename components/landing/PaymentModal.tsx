"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2, X, Shield, Star, Crown, PartyPopper, Zap, CheckCircle } from "lucide-react";
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import Confetti from 'react-confetti';

const BANK_INFO = { BANK_ID: "ACB", ACCOUNT_NO: "189362839", TEMPLATE: "PRINT", ACCOUNT_NAME: "LE QUOC DUNG" };

export default function PaymentModal({ isOpen, onClose, plan: initialPlan }: { isOpen: boolean; onClose: () => void; plan: string }) {
  const { profile, user } = useAuth();
  const [isPaymentReady, setIsPaymentReady] = useState(false); 
  const [isUserConfirmed, setIsUserConfirmed] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(false); 
  const initialExpiryRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen || !user || !profile) return;
    if (initialExpiryRef.current === 0) initialExpiryRef.current = profile.expiryDate?.seconds || 0;

    const unsub = onSnapshot(doc(db, "users", user.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newExpiry = data.expiryDate?.seconds || 0;
        const newPlan = data.plan;

        if (newExpiry > initialExpiryRef.current || newPlan !== profile.plan) {
          // 🚀 WEBHOOK THÀNH CÔNG -> TỰ CHIA HOA HỒNG LUÔN
          const referrerKey = data.referredBy;
          if (referrerKey) {
            const planPrices: any = { "starter": 30, "yearly": 299, "LIFETIME": 999 };
            const comm = Number(((planPrices[newPlan] || 0) * 0.4).toFixed(2));
            const q = query(collection(db, "users"), where("licenseKey", "==", referrerKey));
            const qSnap = await getDocs(q);
            if (!qSnap.empty) {
                const rDoc = qSnap.docs[0];
                const rData = rDoc.data();
                await updateDoc(rDoc.ref, {
                    "wallet.available": Number(((rData.wallet?.available || 0) + comm).toFixed(2)),
                    referrals: (rData.referrals || []).map((r: any) => (r.uid === user.uid) ? { ...r, status: 'approved', plan: newPlan, commission: comm, updatedAt: new Date().toISOString() } : r)
                });
            }
          }
          setIsPaymentReady(true);
        }
      }
    });
    return () => unsub();
  }, [isOpen, user?.uid]);

  useEffect(() => { if (isPaymentReady && isUserConfirmed) setIsSuccess(true); }, [isPaymentReady, isUserConfirmed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl">
      {isSuccess && <Confetti />}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl">
        {/* Giữ nguyên UI QR và Nút của ông... */}
        {isSuccess ? (
            <div className="text-center py-10">
                <PartyPopper size={60} className="text-yellow-400 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-black text-white italic tracking-tighter">NẠP QUÂN LƯƠNG THÀNH CÔNG!</h2>
                <button onClick={() => window.location.reload()} className="mt-8 w-full bg-green-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2"><Crown size={20}/> VÀO CHIẾN TRƯỜNG</button>
            </div>
        ) : (
            <div className="flex flex-col items-center">
                <h2 className="text-xl font-black text-white mb-6 uppercase italic">Quét mã nạp tiền</h2>
                <div className="bg-white p-4 rounded-3xl mb-6 shadow-lg">
                    <img src={`https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${BANK_INFO.ACCOUNT_NO}-PRINT.png?amount=25500&addInfo=${profile?.licenseKey}%20${initialPlan.toUpperCase()}`} alt="QR" className="w-48 h-48" />
                </div>
                <button onClick={() => setIsUserConfirmed(true)} className={`w-full py-4 font-black rounded-xl transition-all shadow-lg ${isPaymentReady ? "bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse text-white" : "bg-slate-800 text-slate-500"}`}>
                   {isPaymentReady ? "XÁC NHẬN KÍCH HOẠT!" : "TÔI ĐÃ CHUYỂN KHOẢN XONG"}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
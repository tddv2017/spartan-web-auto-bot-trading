"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, AlertTriangle, Lock } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
      
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 py-6 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors group">
            <ArrowLeft className="text-white group-hover:-translate-x-1 transition-transform" />
          </Link>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="text-green-500" />
            PHÁP LÝ & ĐIỀU KHOẢN <span className="text-green-500">SPARTAN AI</span>
          </h1>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-16">
        
        {/* 1. ĐIỀU KHOẢN SỬ DỤNG */}
        <section id="terms" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <FileText className="text-blue-500" size={32} />
            <h2 className="text-2xl font-bold text-white uppercase">1. Điều khoản Sử dụng Dịch vụ</h2>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-sm leading-relaxed space-y-4">
            <p className="font-medium text-white">Chào mừng bạn đến với hệ thống giao dịch tự động Spartan AI. Khi mua và kích hoạt License Key, bạn đồng ý tuân thủ các quy định sau:</p>
            <ul className="list-disc pl-5 space-y-3 marker:text-blue-500 text-slate-400">
              <li>
                <strong className="text-slate-200">Quyền sở hữu License:</strong> License Key được cấp là tài sản cá nhân, gắn liền với tài khoản MT5 của bạn. Nghiêm cấm chia sẻ, bán lại (Resell) hoặc sử dụng chung dưới mọi hình thức (trừ gói Agency).
              </li>
              <li>
                <strong className="text-slate-200">Hành vi bị cấm:</strong> Mọi hành vi cố tình bẻ khóa (Crack), dịch ngược mã nguồn (Decompile), hoặc tấn công hệ thống máy chủ xác thực sẽ dẫn đến việc <strong>KHÓA VĨNH VIỄN</strong> tài khoản mà không cần báo trước.
              </li>
              <li>
                <strong className="text-slate-200">Thay đổi thiết bị:</strong> Chúng tôi hỗ trợ Reset License Key miễn phí tối đa <strong>1 lần/tháng</strong> trong trường hợp bạn thay đổi máy tính (VPS) hoặc đổi Broker.
              </li>
            </ul>
          </div>
        </section>

        {/* 2. CẢNH BÁO RỦI RO (QUAN TRỌNG) */}
        <section className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6 border-b border-amber-900/30 pb-4">
            <AlertTriangle className="text-amber-500 animate-pulse" size={32} />
            <h2 className="text-2xl font-bold text-amber-500 uppercase">2. Cảnh báo Rủi ro & Miễn trừ</h2>
          </div>
          <div className="bg-amber-950/20 p-8 rounded-3xl border border-amber-500/20 text-sm leading-relaxed space-y-4">
            <p className="font-bold text-amber-200 uppercase tracking-wide">⚠️ GIAO DỊCH TÀI CHÍNH (FOREX/GOLD) TIỀM ẨN RỦI RO CAO:</p>
            <ul className="list-disc pl-5 space-y-3 marker:text-amber-500 text-amber-100/70">
              <li>
                <strong className="text-amber-100">Không đảm bảo lợi nhuận:</strong> Kết quả giao dịch trong quá khứ (Backtest) chỉ mang tính chất tham khảo và <strong>KHÔNG</strong> đảm bảo kết quả trong tương lai. Thị trường luôn biến động khó lường.
              </li>
              <li>
                <strong className="text-amber-100">Vai trò của Spartan AI:</strong> Chúng tôi cung cấp công cụ phần mềm (Software Tool). Chúng tôi <strong>KHÔNG</strong> phải là cố vấn tài chính, không nhận ủy thác đầu tư và không chịu trách nhiệm cho các quyết định vào lệnh của Bot.
              </li>
              <li>
                <strong className="text-amber-100">Rủi ro kỹ thuật:</strong> Chúng tôi không chịu trách nhiệm cho các khoản lỗ phát sinh do: Lỗi đường truyền mạng (VPS mất kết nối), Sàn giao dịch (Broker) giãn spread quá mức, trượt giá (Slippage), hoặc sự can thiệp sai lầm của người dùng.
              </li>
            </ul>
          </div>
        </section>

        {/* 3. CHÍNH SÁCH BẢO MẬT & HOÀN TIỀN */}
        <section id="policy" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <Lock className="text-green-500" size={32} />
            <h2 className="text-2xl font-bold text-white uppercase">3. Chính sách Bảo mật & Hoàn tiền</h2>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-sm leading-relaxed space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> BẢO MẬT DỮ LIỆU
                </h3>
                <p className="text-slate-400">Thông tin MT5 ID và Email của bạn chỉ được sử dụng duy nhất cho mục đích kích hoạt bản quyền. Chúng tôi cam kết tuyệt đối không chia sẻ dữ liệu này cho bên thứ 3.</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span> HOÀN TIỀN (REFUND)
                </h3>
                <p className="text-slate-400">Do tính chất là Sản phẩm số (Digital Product), chúng tôi <strong>KHÔNG HOÀN TIỀN</strong> sau khi Key đã được gửi đi và kích hoạt thành công. Vui lòng cân nhắc kỹ trước khi thanh toán.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER ACTION */}
        <div className="text-center pt-8 border-t border-slate-900">
          <p className="text-slate-500 text-xs mb-6 italic">
            Cập nhật lần cuối: 02/02/2026. Spartan AI có quyền sửa đổi các điều khoản này bất cứ lúc nào.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105"
          >
            <ShieldCheck size={20} />
            ĐÃ HIỂU & QUAY LẠI TRANG CHỦ
          </Link>
        </div>

      </div>
    </div>
  );
}
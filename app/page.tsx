import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import Footer from "../components/landing/Footer";
import Performance from "@/components/landing/Performance";
import VerifiedReport from "@/components/landing/VerifiedReport";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-green-500 selection:text-black overflow-x-hidden">
      
      {/* Background Grid chung cho cả trang */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <Performance />
        {/* CHÈN VÀO ĐÂY: Show bằng chứng ngay sau khi khoe hiệu suất */}
        <VerifiedReport />
        <Pricing />
      </main>

      <Footer />
      
    </div>
  );
}
import LivePerformance from "@/components/LivePerformance";

export default function MonitorPage() {
  return (
    <main className="min-h-screen bg-black p-4 md:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-white tracking-tighter italic">
          SPARTAN <span className="text-green-500">CONTROL CENTER</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Hệ thống giám sát tín hiệu MT5 - Chế độ thử nghiệm
        </p>
      </div>

      {/* Gọi Radar Live Performance vào đây */}
      <LivePerformance />
      
      <div className="mt-10 text-center text-xs text-gray-700">
        Đang quét mã hiệu: <span className="text-gray-500">SPARTAN-DEMO</span>
      </div>
    </main>
  );
}
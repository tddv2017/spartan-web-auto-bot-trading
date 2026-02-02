// lib/content.ts

export const content = {
  vi: {
    nav: {
      features: "Tính Năng",
      performance: "Hiệu Quả",
      pricing: "Bảng Giá",
      dashboard: "DASHBOARD",
    },
    hero: {
      badge: "AI Core V7.2 Đã Kích Hoạt",
      title_1: "SĂN VÀNG CÙNG",
      title_2: "SPARTAN SNIPER",
      desc: "Hệ thống giao dịch tự động <strong>Dual-Core</strong> đầu tiên. Chuyển đổi linh hoạt giữa <span class='text-white'>Scalping tốc độ cao</span> và <span class='text-white'>Swing dài hạn</span>.",
      cta_primary: "Thuê Bot Ngay",
      cta_secondary: "Video Backtest",
      stats: { winrate: "Tỷ lệ Win", profit: "Lợi nhuận", latency: "Độ trễ", users: "Người dùng" }
    },
    features: {
      sub: "// THÔNG SỐ KỸ THUẬT",
      title: "CÔNG NGHỆ TỐI THƯỢNG",
      items: [
        { title: "Dual-Core Engine", desc: "Tích hợp 2 chế độ: 'Sát thủ' (Scalping M5) và 'Săn mồi' (Swing H1). Mua 1 được 2." },
        { title: "Smart Adaptive Spread", desc: "AI tự động nới lỏng Spread khi phát hiện TP lớn. Không bỏ lỡ cơ hội khi bão giá." },
        { title: "Capital Guard", desc: "Bảo vệ vốn nhỏ ($50). Tự động ép MinLot và tính toán rủi ro." },
        { title: "Prop-Firm Ready", desc: "Thuật toán cắt gọt Volume chuẩn 100% quy tắc Max Lot của FTMO/MFF." },
        { title: "Zero Latency", desc: "Mã nguồn tối ưu tốc độ khớp lệnh ánh sáng (<5ms). Triệt tiêu trượt giá." },
        { title: "Absolute Control", desc: "Kill-Switch, Time Guard (né tin) và Friday Exit. SL/TP ẩn tránh quét." }
      ]
    },
    // 👉 THÊM MỚI: PHẦN HIỆU QUẢ
    performance: {
      sub: "// DỮ LIỆU THỰC CHIẾN",
      title: "LỢI NHUẬN ĐƯỢC CHỨNG MINH",
      desc: "Kết quả giao dịch thực tế trên tài khoản Live (ECN). Mọi lệnh đều được công khai minh bạch.",
      stats: {
        total_gain: "Tổng Lợi Nhuận",
        monthly: "Trung Bình Tháng",
        drawdown: "Max Drawdown",
        won_trades: "Lệnh Thắng"
      },
      live_log: {
        title: "NHẬT KÝ GIAO DỊCH (LIVE)",
        col_time: "Thời gian",
        col_symbol: "Cặp tiền",
        col_type: "Loại",
        col_profit: "Lợi nhuận"
      }
    },
    // 👉 THÊM MỚI MỤC REPORT (TIẾNG VIỆT)
    report: {
      title: "BÁO CÁO KIỂM TOÁN (AUDIT REPORT)",
      subtitle: "Xác thực bởi MetaQuotes Strategy Tester",
      status: "TRẠNG THÁI: ĐÃ THÔNG QUA",
      server_info: {
        server: "Máy chủ",
        ea: "Bot",
        period: "Giai đoạn"
      },
      stats: {
        net_profit: "Tổng Lợi Nhuận",
        profit_factor: "Profit Factor", // Giữ nguyên thuật ngữ chuyên ngành
        total_trades: "Tổng Số Lệnh",
        max_dd: "Max Drawdown",
        short_win: "Tỉ lệ Thắng (Short)",
        long_win: "Tỉ lệ Thắng (Long)",
        initial_deposit: "Vốn Ban Đầu",
        abs_dd: "Absolute DD"
      },
      journal: {
        title: "// TRÍCH XUẤT NHẬT KÝ (BẰNG CHỨNG LIVE)",
        headers: ["Thời gian", "Mã lệnh", "Loại", "Giá", "Lợi nhuận", "Ghi chú"]
      },
      btn: {
        title: "Báo cáo gốc đầy đủ",
        desc: "File HTML xuất trực tiếp từ MT5. Không chỉnh sửa.",
        download: "TẢI VỀ KIỂM CHỨNG"
      }
    },
    pricing: {
      title: "BẢNG GIÁ CHIẾN LƯỢC",
      sub: "Lựa chọn gói phù hợp để tối ưu lợi nhuận của bạn.",
      
      // 2. MONTHLY
      starter: {
        name: "THUÊ THÁNG",
        price: "$30",
        period: "/tháng",
        btn: "Thuê Ngay",
        features: ["Full Tính năng V7.2", "Tự động vào lệnh 100%", "Chế độ Scalp + Swing", "Hỗ trợ 1 Tài khoản Live", "Support 24/7"]
      },
      // 3. YEARLY ($299)
      yearly: {
        name: "THUÊ 1 NĂM",
        price: "$299",
        period: "/năm",
        btn: "Đăng Ký Ngay",
        tag: "Khuyên Dùng",
        features: ["Full Tính năng V7.2", "Tự động vào lệnh 100%", "Hỗ trợ 1 Tài khoản Live", "Tặng VPS 6 tháng", "Ưu tiên Support"]
      },
      // 4. LIFETIME ($699)
      lifetime: {
        name: "MUA TRỌN ĐỜI",
        price: "$9999",
        period: "/vĩnh viễn",
        btn: "Trở Thành Đối Tác",
        tag: "Business VIP",
        features: ["Sở hữu vĩnh viễn V7.2", "Free Update trọn đời", "Hỗ trợ 1 Tài khoản Live", "Tặng VPS 1 năm", "Đặc quyền: Làm Reseller (Hoa hồng 40%)"]
      }
    },
    footer: {
      rights: "SPARTAN TRADING SYSTEM © 2026",
      terms: "Điều khoản",
      policy: "Chính sách",
      contact: "Liên hệ"
    }
  },
  
  // --- ENGLISH VERSION ---
  en: {
    nav: {
      features: "Features",
      performance: "Performance",
      pricing: "Pricing",
      dashboard: "DASHBOARD",
    },
    hero: {
      badge: "AI Core V7.2 Online",
      title_1: "HUNT GOLD WITH",
      title_2: "SPARTAN SNIPER",
      desc: "The first <strong>Dual-Core</strong> automated trading system. Seamlessly switch between <span class='text-white'>High-Speed Scalping</span> and <span class='text-white'>Long-Term Swing</span>.",
      cta_primary: "Rent Bot Now",
      cta_secondary: "Live Signals",
      stats: { winrate: "Win Rate", profit: "Profit Factor", latency: "Latency", users: "Active Users" }
    },
    features: {
      sub: "// TECHNICAL SPECS",
      title: "ULTIMATE TECHNOLOGY",
      items: [
        { title: "Dual-Core Engine", desc: "2 Modes: 'Assassin' (Scalping M5) and 'Hunter' (Swing H1). 2-in-1 Deal." },
        { title: "Smart Adaptive Spread", desc: "AI auto-adjusts Spread tolerance for high TP trades. Never miss a trade." },
        { title: "Capital Guard", desc: "Small capital protection ($50). Auto-enforces MinLot and risk calculation." },
        { title: "Prop-Firm Ready", desc: "Strictly complies with Prop Firm Max Lot rules (FTMO/MFF)." },
        { title: "Zero Latency", desc: "Optimized code for light-speed execution (<5ms). Minimizes slippage." },
        { title: "Absolute Control", desc: "Kill-Switch, Time Guard, Friday Exit. Hidden SL/TP against stop hunts." }
      ]
    },
    performance: {
      sub: "// TRACK RECORD",
      title: "PROVEN PERFORMANCE",
      desc: "Live trading results on ECN accounts. Every trade is transparently verified.",
      stats: {
        total_gain: "Total Gain",
        monthly: "Monthly Avg",
        drawdown: "Max Drawdown",
        won_trades: "Trades Won"
      },
      live_log: {
        title: "LIVE TRADING JOURNAL",
        col_time: "Time",
        col_symbol: "Symbol",
        col_type: "Type",
        col_profit: "Profit"
      }
    },
    // 👉 ADD REPORT SECTION (ENGLISH)
    report: {
      title: "AUDIT REPORT (VERIFIED)",
      subtitle: "Verified by MetaQuotes Strategy Tester",
      status: "STATUS: PASSED",
      server_info: {
        server: "Server",
        ea: "Expert Advisor",
        period: "Period"
      },
      stats: {
        net_profit: "Total Net Profit",
        profit_factor: "Profit Factor",
        total_trades: "Total Trades",
        max_dd: "Max Drawdown",
        short_win: "Short Win %",
        long_win: "Long Win %",
        initial_deposit: "Initial Deposit",
        abs_dd: "Absolute DD"
      },
      journal: {
        title: "// TRADING JOURNAL EXTRACT (LIVE PROOF)",
        headers: ["Time", "Deal", "Type", "Price", "Profit", "Comment"]
      },
      btn: {
        title: "Full Original Report",
        desc: "Direct HTML export from MT5. Unedited.",
        download: "DOWNLOAD PROOF"
      }
    },
    pricing: {
      title: "STRATEGIC PRICING",
      sub: "Choose the plan that fits your trading goals.",

      // 2. MONTHLY
      starter: {
        name: "MONTHLY",
        price: "$30",
        period: "/mo",
        btn: "Rent Now",
        features: ["Full Features V7.2", "100% Auto Execution", "Scalp + Swing Modes", "1 Live Account", "24/7 Support"]
      },
      // 3. YEARLY
      yearly: {
        name: "YEARLY",
        price: "$299",
        period: "/yr",
        btn: "Save Now",
        tag: "Best Choice",
        features: ["Full Features V7.2", "100% Auto Execution", "1 Live Accounts", "Free VPS (6 mos)", "Priority Support"]
      },
      // 4. LIFETIME ($699)
      lifetime: {
        name: "LIFETIME",
        price: "$9999",
        period: "/life",
        btn: "Become Partner",
        tag: "Business VIP",
        features: ["Lifetime License V7.2", "Free Lifetime Updates", "1 Live Accounts", "Free VPS (1 year)", "Reseller Rights (40% Commission)"]
      }
    },
    footer: {
      rights: "SPARTAN TRADING SYSTEM © 2026",
      terms: "Terms of Service",
      policy: "Privacy Policy",
      contact: "Contact Us"
    }
  }
};
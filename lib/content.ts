// app/lib/content.ts

export const content = {
  // ==============================
  // 🇻🇳 PHẦN TIẾNG VIỆT
  // ==============================
  vi: {
    nav: {
      features: "Tính Năng",
      performance: "Hiệu Quả",
      pricing: "Bảng Giá",
      dashboard: "DASHBOARD",
      login: "Đăng nhập",
      join: "THAM CHIẾN",
      activated: "Đã kích hoạt",
      warrior: "Chiến Binh"
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
      },
      highlights: {
        pf_badge: "Profit Factor 3.27",
        compounding_badge: "Lãi kép cực đại",
        risk_badge: "Rủi ro siêu thấp",
        winrate_badge: "Winrate ~97.4%",
        card1_val: "$7.3M+",
        card1_label: "TỔNG LỢI NHUẬN",
        card2_val: "Autoscale",
        card2_label: "TRUNG BÌNH THÁNG",
        card3_val: "0.2 Lot",
        card3_label: "BẢO TOÀN VỐN",
        card4_val: "1,240+",
        card4_label: "NGƯỜI DÙNG ACTIVE"
      },
      efficiency: {
        tag: "LIVE PERFORMANCE",
        title_1: "KẾT QUẢ THỰC CHIẾN",
        title_2: "KHÔNG BIẾT NÓI DỐI",
        desc: "Dữ liệu được Backtest trên dữ liệu thật (Real Tick Data) độ chính xác 99.9% từ năm 2020 đến nay. Spartan V30 duy trì sự ổn định ngay cả trong những đợt bão giá mạnh nhất.",
        items: {
          winrate: "Winrate trung bình",
          rr: "Risk/Reward Ratio (RR)",
          dd: "Max Drawdown (Sụt giảm tối đa)"
        },
        terminal: {
          init: "KHỞI ĐỘNG SPARTAN V30...",
          scan: "Đang quét XAUUSD khung M15...",
          signal: "PHÁT HIỆN TÍN HIỆU: Breakout Cản",
          buy: "MỞ MUA",
          trailing: "Giá đạt TP1. Kích hoạt Trailing Stop.",
          tp: "CHỐT LỜI",
          balance: "Cập nhật số dư:"
        }
      }
    },
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
        profit_factor: "Profit Factor",
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
      starter: {
        name: "THUÊ THÁNG",
        price: "$9",
        period: "/tháng",
        btn: "Thuê Ngay",
        features: ["Full Tính năng V7.2", "Tự động vào lệnh 100%", "Chế độ Scalp + Swing", "Hỗ trợ 1 Tài khoản Live", "Support 24/7"]
      },
      yearly: {
        name: "THUÊ 1 NĂM",
        price: "$299",
        period: "/năm",
        btn: "Đăng Ký Ngay",
        tag: "Khuyên Dùng",
        features: ["Full Tính năng V7.2", "Tự động vào lệnh 100%", "Hỗ trợ 1 Tài khoản Live", "Tặng VPS 6 tháng", "Ưu tiên Support"]
      },
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
      terms: "Điều khoản sử dụng",
      policy: "Chính sách bảo mật",
      contact: "Liên hệ",
      description: "Hệ thống giao dịch tự động sử dụng thuật toán AI Dual-Core tiên tiến nhất. Tối ưu hóa lợi nhuận vàng (XAUUSD) với rủi ro thấp nhất thị trường.",
      support: "Hỗ trợ trực tuyến",
      nav_title: "ĐIỀU HƯỚNG",
      legal_title: "PHÁP LÝ & HỖ TRỢ"
    },
    dashboard: {
      loading: "Đang quét danh bạ chiến binh...",
      home: "Trang chủ",
      logout: "RÚT QUÂN",
      welcome: "CHÀO CHIẾN BINH",
      status: {
        expired: "Gói cước đã hết hạn - Yêu cầu gia hạn",
        active: "Hệ thống đang hoạt động",
        unconnected: "CHƯA KẾT NỐI",
        lifetime: "Vĩnh viễn",
        updating: "Đang cập nhật..."
      },
      btn: {
        renew: "GIA HẠN",
        upgrade: "NÂNG CẤP",
        copy: "SAO CHÉP MÃ",
        copied: "ĐÃ SAO CHÉP",
        download: "TẢI BOT NGAY",
        video: "Xem Video hướng dẫn chi tiết"
      },
      license: {
        title: "Kích hoạt License tại MT5",
        note: "* Copy mã này dán vào mục Input của Bot Spartan trên MT5."
      },
      download: {
        title: "Kho Vũ Khí Spartan V3.0",
        unlocked: "Đã mở khóa tải xuống",
        locked: "Vui lòng nâng cấp gói để tải Bot."
      },
      stats: {
        account: "Tài khoản MT5",
        expiry: "Hạn sử dụng",
        rank: "Quân hàm"
      },
      guide: {
        title: "Hướng dẫn kích hoạt",
        step1_title: "Cài đặt vào MT5",
        step1_desc: "Copy file 'Spartan_Final.ex5' vào thư mục MQL5/Experts trên phần mềm MT5.",
        step2_title: "Cấu hình WebRequest",
        step2_desc: "Vào Tools > Options > Expert Advisors. Tích chọn 'Allow WebRequest' và thêm URL:",
        step3_title: "Nhập License Key",
        step3_desc: "Kéo Bot vào biểu đồ XAUUSD (M15). Tại mục Input, dán License Key của bạn vào."
      }
    },
    loginPage: {
      back: "Quay lại Trang chủ",
      title: "SPARTAN COMMAND",
      sub: "Đăng nhập hoặc Đăng ký để truy cập hệ thống Bot V7.2",
      google: "Tiếp tục với Google",
      processing: "Đang kết nối...",
      secure: "Bảo mật tuyệt đối bởi Google Firebase",
      no_account: "Chưa có tài khoản?",
      auto_create: "Hệ thống sẽ tự động tạo mới",
      when_login: "khi bạn đăng nhập bằng Google."
    },
    termsPage: {
      header: "PHÁP LÝ & ĐIỀU KHOẢN",
      last_update: "Cập nhật lần cuối: 02/02/2026. Spartan AI có quyền sửa đổi các điều khoản này bất cứ lúc nào.",
      btn_home: "ĐÃ HIỂU & QUAY LẠI TRANG CHỦ",
      sec1: {
        title: "1. Điều khoản Sử dụng Dịch vụ",
        intro: "Chào mừng bạn đến với hệ thống giao dịch tự động Spartan AI. Khi mua và kích hoạt License Key, bạn đồng ý tuân thủ các quy định sau:",
        items: [
          { label: "Quyền sở hữu License:", text: "License Key được cấp là tài sản cá nhân, gắn liền với tài khoản MT5 của bạn. Nghiêm cấm chia sẻ, bán lại (Resell) hoặc sử dụng chung dưới mọi hình thức (trừ gói Agency)." },
          { label: "Hành vi bị cấm:", text: "Mọi hành vi cố tình bẻ khóa (Crack), dịch ngược mã nguồn (Decompile), hoặc tấn công hệ thống máy chủ xác thực sẽ dẫn đến việc KHÓA VĨNH VIỄN tài khoản mà không cần báo trước." },
          { label: "Thay đổi thiết bị:", text: "Chúng tôi hỗ trợ Reset License Key miễn phí tối đa 1 lần/tháng trong trường hợp bạn thay đổi máy tính (VPS) hoặc đổi Broker." }
        ]
      },
      sec2: {
        title: "2. Cảnh báo Rủi ro & Miễn trừ",
        warning: "⚠️ GIAO DỊCH TÀI CHÍNH (FOREX/GOLD) TIỀM ẨN RỦI RO CAO:",
        items: [
          { label: "Không đảm bảo lợi nhuận:", text: "Kết quả giao dịch trong quá khứ (Backtest) chỉ mang tính chất tham khảo và KHÔNG đảm bảo kết quả trong tương lai. Thị trường luôn biến động khó lường." },
          { label: "Vai trò của Spartan AI:", text: "Chúng tôi cung cấp công cụ phần mềm (Software Tool). Chúng tôi KHÔNG phải là cố vấn tài chính, không nhận ủy thác đầu tư và không chịu trách nhiệm cho các quyết định vào lệnh của Bot." },
          { label: "Rủi ro kỹ thuật:", text: "Chúng tôi không chịu trách nhiệm cho các khoản lỗ phát sinh do: Lỗi đường truyền mạng (VPS mất kết nối), Sàn giao dịch (Broker) giãn spread quá mức, trượt giá (Slippage), hoặc sự can thiệp sai lầm của người dùng." }
        ]
      },
      sec3: {
        title: "3. Chính sách Bảo mật & Hoàn tiền",
        privacy_title: "BẢO MẬT DỮ LIỆU",
        privacy_text: "Thông tin MT5 ID và Email của bạn chỉ được sử dụng duy nhất cho mục đích kích hoạt bản quyền. Chúng tôi cam kết tuyệt đối không chia sẻ dữ liệu này cho bên thứ 3.",
        refund_title: "HOÀN TIỀN (REFUND)",
        refund_text: "Do tính chất là Sản phẩm số (Digital Product), chúng tôi KHÔNG HOÀN TIỀN sau khi Key đã được gửi đi và kích hoạt thành công. Vui lòng cân nhắc kỹ trước khi thanh toán."
      }
    },
    payment: {
      title: "LỰA CHỌN QUÂN HÀM",
      loading: "Đang tính toán tỷ giá...",
      total: "Tổng thanh toán:",
      pay_via: "Thanh toán qua:",
      bank_transfer: "Chuyển khoản nhanh (VietQR)",
      crypto_transfer: "Ví Crypto (USDT TRC20)",
      wallet_label: "Địa chỉ ví nhận tiền:",
      copy: "SAO CHÉP",
      copied: "ĐÃ CHÉP",
      agree_text: "Tôi đồng ý với Điều khoản & Chính sách rủi ro. Tôi hiểu rằng thị trường có rủi ro và không yêu cầu hoàn tiền sau khi nhận Key.",
      btn_confirm: "XÁC NHẬN & TẠO LỆNH",
      btn_processing: "ĐANG XỬ LÝ...",
      success: "✅ Đã ghi nhận! Vui lòng chờ Admin duyệt."
    }
  },

  // ==============================
  // 🇺🇸 PHẦN TIẾNG ANH (ENGLISH)
  // ==============================
  en: {
    nav: {
      features: "Features",
      performance: "Performance",
      pricing: "Pricing",
      dashboard: "DASHBOARD",
      login: "Login",
      join: "JOIN NOW",
      activated: "Activated",
      warrior: "Warrior"
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
      highlights: {
        pf_badge: "Profit Factor 3.27",
        compounding_badge: "Max Compounding",
        risk_badge: "Ultra Low Risk",
        winrate_badge: "Winrate ~97.4%",
        card1_val: "$7.3M+",
        card1_label: "TOTAL PROFIT",
        card2_val: "Autoscale",
        card2_label: "MONTHLY AVG",
        card3_val: "0.2 Lot",
        card3_label: "CAPITAL GUARD",
        card4_val: "1,240+",
        card4_label: "ACTIVE USERS"
      },
      live_log: {
        title: "LIVE TRADING JOURNAL",
        col_time: "Time",
        col_symbol: "Symbol",
        col_type: "Type",
        col_profit: "Profit"
      },
      efficiency: {
        tag: "LIVE PERFORMANCE",
        title_1: "REAL BATTLE RESULTS",
        title_2: "NEVER LIE",
        desc: "Backtested on Real Tick Data with 99.9% accuracy since 2020. Spartan V30 maintains stability even during the strongest market storms.",
        items: {
          winrate: "Average Winrate",
          rr: "Risk/Reward Ratio (RR)",
          dd: "Max Drawdown"
        },
        terminal: {
          init: "SPARTAN V30 INITIALIZED...",
          scan: "Scanning XAUUSD timeframe M15...",
          signal: "Signal DETECTED: Breakout Resistance",
          buy: "OPEN BUY",
          trailing: "Price reached TP1. Trailing Stop active.",
          tp: "TAKE PROFIT",
          balance: "Balance updated:"
        }
      }
    }, 
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
      starter: {
        name: "MONTHLY",
        price: "$30",
        period: "/mo",
        btn: "Rent Now",
        features: ["Full Features V7.2", "100% Auto Execution", "Scalp + Swing Modes", "1 Live Account", "24/7 Support"]
      },
      yearly: {
        name: "YEARLY",
        price: "$299",
        period: "/yr",
        btn: "Save Now",
        tag: "Best Choice",
        features: ["Full Features V7.2", "100% Auto Execution", "1 Live Accounts", "Free VPS (6 mos)", "Priority Support"]
      },
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
      contact: "Contact Us",
      description: "Automated trading system using advanced AI Dual-Core algorithms. Optimizing Gold (XAUUSD) profits with the lowest risk in the market.",
      support: "Live Support",
      nav_title: "NAVIGATION",
      legal_title: "LEGAL & HELP"
    },
    dashboard: {
      loading: "Scanning warrior directory...",
      home: "Home",
      logout: "LOGOUT",
      welcome: "WELCOME WARRIOR",
      status: {
        expired: "Plan expired - Renewal required",
        active: "System is active",
        unconnected: "UNCONNECTED",
        lifetime: "Lifetime",
        updating: "Updating..."
      },
      btn: {
        renew: "RENEW",
        upgrade: "UPGRADE",
        copy: "COPY KEY",
        copied: "COPIED",
        download: "DOWNLOAD BOT",
        video: "Watch detailed video tutorial"
      },
      license: {
        title: "Activate License on MT5",
        note: "* Copy this key and paste it into the Input section of Spartan Bot on MT5."
      },
      download: {
        title: "Spartan V3.0 Arsenal",
        unlocked: "Download unlocked",
        locked: "Please upgrade your plan to download the Bot."
      },
      stats: {
        account: "MT5 Account",
        expiry: "Expiry Date",
        rank: "Rank"
      },
      guide: {
        title: "Activation Guide",
        step1_title: "Install to MT5",
        step1_desc: "Copy 'Spartan_Final.ex5' file to MQL5/Experts folder on MT5.",
        step2_title: "Configure WebRequest",
        step2_desc: "Go to Tools > Options > Expert Advisors. Check 'Allow WebRequest' and add URL:",
        step3_title: "Enter License Key",
        step3_desc: "Drag Bot to XAUUSD chart (M15). Paste your License Key in the Input section."
      }
    },
    loginPage: {
      back: "Back to Home",
      title: "SPARTAN COMMAND",
      sub: "Login or Register to access Bot V7.2 System",
      google: "Continue with Google",
      processing: "Connecting...",
      secure: "Secured by Google Firebase",
      no_account: "No account yet?",
      auto_create: "System automatically creates one",
      when_login: "when you login with Google."
    },
    termsPage: {
      header: "LEGAL & TERMS",
      last_update: "Last updated: Feb 02, 2026. Spartan AI reserves the right to modify these terms at any time.",
      btn_home: "UNDERSTOOD & RETURN HOME",
      sec1: {
        title: "1. Terms of Service",
        intro: "Welcome to Spartan AI automated trading system. By purchasing and activating the License Key, you agree to the following:",
        items: [
          { label: "License Ownership:", text: "The issued License Key is personal property linked to your MT5 account. Sharing, reselling, or joint usage is strictly prohibited (except for Agency plans)." },
          { label: "Prohibited Acts:", text: "Any attempt to Crack, Decompile, or attack the authentication server will result in PERMANENT BAN without prior notice." },
          { label: "Device Change:", text: "We support free License Key Reset up to 1 time/month in case you change VPS or Broker." }
        ]
      },
      sec2: {
        title: "2. Risk Warning & Disclaimer",
        warning: "⚠️ FINANCIAL TRADING (FOREX/GOLD) CARRIES HIGH RISK:",
        items: [
          { label: "No Profit Guarantee:", text: "Past performance (Backtest) is for reference only and does NOT guarantee future results. The market is always volatile." },
          { label: "Spartan AI's Role:", text: "We provide software tools. We are NOT financial advisors, do not accept investment entrustment, and are not responsible for the Bot's trading decisions." },
          { label: "Technical Risks:", text: "We are not responsible for losses caused by: Network errors (VPS disconnection), Broker issues (high spread/slippage), or incorrect user intervention." }
        ]
      },
      sec3: {
        title: "3. Privacy & Refund Policy",
        privacy_title: "DATA PRIVACY",
        privacy_text: "Your MT5 ID and Email are used solely for license activation purposes. We strictly pledge not to share this data with third parties.",
        refund_title: "REFUND POLICY",
        refund_text: "Due to the nature of Digital Products, we DO NOT OFFER REFUNDS once the Key has been sent and activated. Please consider carefully before paying."
      }
    },
    payment: {
      title: "CHOOSE YOUR RANK",
      loading: "Calculating rates...",
      total: "Total Amount:",
      pay_via: "Payment Method:",
      bank_transfer: "Local Bank Transfer",
      crypto_transfer: "Crypto Wallet (USDT TRC20)",
      wallet_label: "Deposit Address:",
      copy: "COPY",
      copied: "COPIED",
      agree_text: "I agree to the Terms & Risk Policy. I understand market risks and will not request a refund after receiving the Key.",
      btn_confirm: "CONFIRM & ORDER",
      btn_processing: "PROCESSING...",
      success: "✅ Order received! Please wait for approval."
    }
  }
};

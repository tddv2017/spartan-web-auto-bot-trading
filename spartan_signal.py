import MetaTrader5 as mt5
import pandas as pd
import pandas_ta as ta
import time
from datetime import datetime
import json
import requests # Dùng để bắn API lên Web

# ================= CẤU HÌNH SPARTAN (GIỐNG HỆT BOT MQL5) =================
SYMBOL = "XAUUSD"
TIMEFRAME = mt5.TIMEFRAME_M15  # Chế độ Scalp (M5/M15) hoặc H1
MODE = "SCALP"                 # hoặc "SWING"

# --- INPUTS ---
LOOKBACK = 12 if MODE == "SCALP" else 24
BREAKOUT_POINTS = 1.5 if MODE == "SCALP" else 3.0 # Đã quy đổi ra Giá (1.5 giá)
TOLERANCE = 1.0 if MODE == "SCALP" else 2.0
EMA_PERIOD = 336 if MODE == "SCALP" else 100
RISK_RATIO_TP1 = 1.0
RISK_RATIO_TP2 = 3.0

# --- SMART SPREAD V7.2 ---
USE_SMART_SPREAD = True
SPREAD_RATIO = 0.15 # 15% của TP

# ================= KẾT NỐI MT5 =================
if not mt5.initialize():
    print("❌ Khởi tạo MT5 thất bại, lỗi: ", mt5.last_error())
    quit()

print(f"🦁 SPARTAN ENGINE STARTED | Symbol: {SYMBOL} | Mode: {MODE}")

def get_data():
    """Lấy dữ liệu nến từ MT5"""
    rates = mt5.copy_rates_from_pos(SYMBOL, TIMEFRAME, 0, 500)
    if rates is None: return None
    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s')
    
    # Tính chỉ báo
    df['ema'] = ta.ema(df['close'], length=EMA_PERIOD)
    df['atr'] = ta.atr(df['high'], df['low'], df['close'], length=20)
    
    return df

def find_box(df):
    """Logic tìm hộp Darvas (Giống MQL5)"""
    # Lấy nến đóng cửa gần nhất (đã hoàn thành)
    # Python index -1 là nến đang chạy, -2 là nến vừa đóng
    # Logic Spartan dùng High/Low của quá khứ
    
    subset = df.iloc[-LOOKBACK-1 : -1] # Lấy khoảng nến quá khứ
    
    highest = subset['high'].max()
    lowest = subset['low'].min()
    
    # Kiểm tra độ nén (Tolerance)
    # Ở đây code đơn giản hóa logic Fractal của MQL5 bằng cách check biên độ
    # Nếu biên độ nến dao động nhỏ -> coi là sideway
    box_height = highest - lowest
    
    # Logic xác định Sideway đơn giản cho Python
    # (Đại tá có thể nâng cấp logic Fractal h1, h2, l1, l2 nếu cần chính xác 100%)
    is_sideway = box_height <= (TOLERANCE + 2.0) # Cho phép du di một chút
    
    return is_sideway, highest, lowest

def check_signal():
    df = get_data()
    if df is None: return
    
    current_price = mt5.symbol_info_tick(SYMBOL).ask
    current_bid = mt5.symbol_info_tick(SYMBOL).bid
    current_close = df.iloc[-1]['close'] # Giá nến đang chạy
    prev_close = df.iloc[-2]['close']    # Giá nến vừa đóng
    
    is_sideway, box_top, box_bot = find_box(df)
    ema_val = df.iloc[-2]['ema']
    atr_val = df.iloc[-2]['atr']
    
    signal = None
    
    # --- LOGIC 1: BOX BREAKOUT ---
    if is_sideway:
        # Breakout UP
        if prev_close > box_top + BREAKOUT_POINTS:
            sl = (box_top + box_bot) / 2
            tp_dist = (current_price - sl) * RISK_RATIO_TP2
            
            # Smart Spread Check V7.2
            spread = (current_price - current_bid)
            max_spread = tp_dist * SPREAD_RATIO if USE_SMART_SPREAD else 0.4
            
            if spread <= max_spread:
                signal = {
                    "type": "BUY (BREAKOUT)",
                    "entry": current_price,
                    "sl": sl,
                    "tp1": current_price + (current_price - sl) * RISK_RATIO_TP1,
                    "tp2": current_price + tp_dist,
                    "desc": "Phá vỡ hộp Darvas",
                    "time": datetime.now().strftime("%H:%M:%S")
                }

        # Breakout DOWN
        elif prev_close < box_bot - BREAKOUT_POINTS:
            sl = (box_top + box_bot) / 2
            tp_dist = (sl - current_bid) * RISK_RATIO_TP2
            
            # Smart Spread Check
            spread = (current_price - current_bid)
            max_spread = tp_dist * SPREAD_RATIO if USE_SMART_SPREAD else 0.4

            if spread <= max_spread:
                signal = {
                    "type": "SELL (BREAKOUT)",
                    "entry": current_bid,
                    "sl": sl,
                    "tp1": current_bid - (sl - current_bid) * RISK_RATIO_TP1,
                    "tp2": current_bid - tp_dist,
                    "desc": "Phá vỡ hộp Darvas",
                    "time": datetime.now().strftime("%H:%M:%S")
                }
    
    # --- LOGIC 2: TREND FOLLOWING (Nếu không Sideway) ---
    else:
        is_uptrend = prev_close > ema_val
        if is_uptrend and prev_close > df.iloc[-3]['high']: # Đỉnh cao hơn
            sl = prev_close - atr_val * 2.0
            signal = {
                "type": "BUY (TREND)",
                "entry": current_price,
                "sl": sl,
                "tp1": current_price + (current_price - sl) * 1.5,
                "tp2": current_price + (current_price - sl) * 3.0,
                "desc": "Xu hướng tăng EMA",
                "time": datetime.now().strftime("%H:%M:%S")
            }
        elif not is_uptrend and prev_close < df.iloc[-3]['low']:
            sl = prev_close + atr_val * 2.0
            signal = {
                "type": "SELL (TREND)",
                "entry": current_bid,
                "sl": sl,
                "tp1": current_bid - (sl - current_bid) * 1.5,
                "tp2": current_bid - (sl - current_bid) * 3.0,
                "desc": "Xu hướng giảm EMA",
                "time": datetime.now().strftime("%H:%M:%S")
            }

    # --- GỬI TÍN HIỆU LÊN WEB ---
    if signal:
        print(f"🚀 TÍN HIỆU MỚI: {signal}")
        # Đoạn này Đại tá sẽ dùng API để bắn lên Database của Web
        # send_to_web(signal) 
    else:
        print(f"💤 No Signal... Box: {is_sideway} | Price: {current_price} | Spread: {(current_price-current_bid):.2f}")

# Vòng lặp chạy liên tục
while True:
    check_signal()
    time.sleep(10) # Check mỗi 10 giây
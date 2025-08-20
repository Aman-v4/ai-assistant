# 🚀 **Multi-API Stock Data Setup Guide**

Your AI Assistant now supports **5 different free APIs** for fetching live stock prices from both Indian and international markets. Here's how to set them up:

## 📊 **API Priority Order**

1. **🥇 Twelve Data** - 800 requests/day, supports 190+ exchanges (NSE, BSE, NASDAQ, NYSE, etc.)
2. **🥈 Polygon.io** - 1000 requests/day, excellent for US stocks
3. **🥉 Finnhub** - 60 calls/minute, good global coverage
4. **🔧 Alpha Vantage** - 500 requests/day (your existing key)
5. **🔄 Yahoo Finance** - Unlimited but unofficial (reliable fallback)

## 🔑 **API Keys Setup**

Create a `.env.local` file in your `ai-assistant` directory with these keys:

```bash
# Primary APIs (Recommended to get at least 2-3 of these)
TWELVE_DATA_API_KEY=your_twelve_data_key_here
POLYGON_API_KEY=your_polygon_key_here
FINNHUB_API_KEY=your_finnhub_key_here

# Your existing API
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Required for app functionality
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: OAuth providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 🆓 **How to Get Free API Keys**

### 1. Twelve Data (Recommended - Best Coverage)
- 🌐 Visit: https://twelvedata.com/pricing
- ✅ Sign up for **FREE** account
- 🎯 **Benefits**: 800 requests/day, supports NSE/BSE + international
- 📍 **Coverage**: 190+ exchanges worldwide
- ⏰ **Real-time**: Yes (15-min delay on free plan)

### 2. Polygon.io (Great for US Stocks)
- 🌐 Visit: https://polygon.io/pricing
- ✅ Sign up for **FREE** starter plan
- 🎯 **Benefits**: 1000 requests/day, excellent US market coverage
- 📍 **Coverage**: US stocks, crypto, forex
- ⏰ **Real-time**: End-of-day data on free plan

### 3. Finnhub (Good Global Backup)
- 🌐 Visit: https://finnhub.io/pricing
- ✅ Sign up for **FREE** account
- 🎯 **Benefits**: 60 calls/minute, global stock coverage
- 📍 **Coverage**: US, European, Asian markets
- ⏰ **Real-time**: Yes (some delays)

### 4. Your Alpha Vantage (Keep as Backup)
- You already have this
- 500 requests/day limit

## 🔧 **Configuration Options**

### Minimum Setup (Works with any 1 API):
```bash
# Just add ONE of these to .env.local
TWELVE_DATA_API_KEY=your_key_here
# OR
POLYGON_API_KEY=your_key_here
# OR 
ALPHA_VANTAGE_API_KEY=your_key_here
```

### Recommended Setup (Best Performance):
```bash
# Add 2-3 APIs for redundancy
TWELVE_DATA_API_KEY=your_key_here
POLYGON_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
```

### Maximum Setup (All APIs):
```bash
# All 5 APIs for maximum reliability
TWELVE_DATA_API_KEY=your_key_here
POLYGON_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
# Yahoo Finance works without a key
```

## 🌍 **Coverage By API**

| API | US Stocks | Indian Stocks | Other International | Real-time | Free Limit |
|-----|-----------|---------------|-------------------|-----------|------------|
| Twelve Data | ✅ | ✅ NSE/BSE | ✅ 190+ exchanges | ⏰ 15min delay | 800/day |
| Polygon.io | ✅ Excellent | ❌ | ✅ Some | ⏰ End-of-day | 1000/day |
| Finnhub | ✅ | ✅ Limited | ✅ | ⏰ Some delay | 60/min |
| Alpha Vantage | ✅ | ✅ | ✅ | ⏰ Real-time | 500/day |
| Yahoo Finance | ✅ | ✅ | ✅ | ⏰ Real-time | Unlimited* |

*Unofficial but very reliable

## 🚀 **Testing**

After setting up your API keys:

1. Restart your dev server: `npm run dev`
2. Test with various stocks:
   - **US**: "Microsoft stock price", "Tesla stock", "Apple stock"
   - **Indian**: "TCS stock price", "Reliance stock", "Infosys stock"
   - **Any Company**: "Palantir stock", "Shopify stock", "Any company name"

## 🛡️ **Fallback System**

The system automatically tries APIs in order:
1. If Twelve Data fails → tries Polygon.io
2. If Polygon.io fails → tries Finnhub  
3. If Finnhub fails → tries Alpha Vantage
4. If Alpha Vantage fails → tries Yahoo Finance
5. If all fail → shows helpful error message

## 💡 **Pro Tips**

- **For Indian Stocks**: Twelve Data + Alpha Vantage work best
- **For US Stocks**: Polygon.io + Yahoo Finance are excellent  
- **For Global Coverage**: Twelve Data + Finnhub combination
- **No API Keys?**: System will still work with Yahoo Finance fallback

---

**✨ Result**: Your AI Assistant can now fetch live stock prices for virtually ANY publicly traded company worldwide using multiple free APIs with automatic failover!

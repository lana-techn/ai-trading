# ⚡ Quick Start Guide

## 🚀 Cara Cepat Menjalankan AI Trading Agent

### 1️⃣ Script Otomatis (RECOMMENDED)
```bash
cd /Users/em/web/trader-ai-agent
./start_servers.sh
```
**Tunggu hingga muncul "Development Environment Ready!" kemudian buka http://localhost:3000/chat**

---

### 2️⃣ Manual (2 Terminal)

**Terminal 1 (Backend):**
```bash
cd /Users/em/web/trader-ai-agent
./start_backend.sh
```

**Terminal 2 (Frontend):**
```bash
cd /Users/em/web/trader-ai-agent
./start_frontend.sh
```

---

### 3️⃣ Test Langsung
```bash
# Test backend
curl http://localhost:8000/health

# Test chat
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is RSI?", "session_id": "test"}'
```

### 🎯 Akses:
- **Chat Interface**: http://localhost:3000/chat
- **Tutorials**: http://localhost:3000/tutorials
- **Main App**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

### ⛔ Stop Servers:
Press `Ctrl+C` atau jalankan:
```bash
lsof -ti:8000 | xargs kill -9 && lsof -ti:3000 | xargs kill -9
```

---

## 📚 Next Steps: Trading Education

Once you have the system running, explore our comprehensive trading education:

### 📚 **Interactive Tutorials** (NEW!)
- **Browse Tutorials**: http://localhost:3000/tutorials
- **Trading Basics**: Learn fundamentals step by step
- **Technical Analysis**: Master chart reading and indicators
- **Trading Strategies**: Discover proven trading approaches
- **Search & Filter**: Find tutorials by category, difficulty, and topics

### 🎯 **Ready for Real Trading?**
- [Complete Transition Guide](./READY_FOR_REAL_TRADING.md) - Step-by-step from paper to real trading
- [Risk Management Guide](./RISK_MANAGEMENT_GUIDE.md) - Comprehensive internal documentation
- [External Resources](./EXTERNAL_RISK_RESOURCES.md) - Professional risk management resources

### 💬 **AI Chat Features** 
Try asking the AI:
- "What is position sizing and how do I calculate it?"
- "Explain the 2% risk rule"
- "How do I set proper stop losses?"
- "What are the key risk management principles?"

> ⚠️ **Important**: All trading education is for informational purposes only. Always practice with paper trading before risking real money.

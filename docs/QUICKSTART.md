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
- **Main App**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

### ⛔ Stop Servers:
Press `Ctrl+C` atau jalankan:
```bash
lsof -ti:8000 | xargs kill -9 && lsof -ti:3000 | xargs kill -9
```
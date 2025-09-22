# 🚀 AI Trading Agent - Panduan Setup Lengkap

## 📋 Panduan Step-by-Step Menjalankan Server

### 🛠️ Setup Awal (Hanya Sekali)

#### 1. Install Dependencies Backend
```bash
cd /Users/em/web/trader-ai-agent/backend
pip3 install -r requirements.txt
pip3 install pydantic-settings seaborn
```

#### 2. Install Dependencies Frontend  
```bash
cd /Users/em/web/trader-ai-agent/frontend
npm install
```

### 🎯 Cara Menjalankan Server (Pilih Salah Satu)

#### ✅ Opsi 1: Script Otomatis (RECOMMENDED)
```bash
cd /Users/em/web/trader-ai-agent
chmod +x start_servers.sh
./start_servers.sh
```

#### ✅ Opsi 2: Terpisah dengan Script
**Terminal 1:**
```bash
cd /Users/em/web/trader-ai-agent
chmod +x start_backend.sh
./start_backend.sh
```

**Terminal 2:**
```bash
cd /Users/em/web/trader-ai-agent  
chmod +x start_frontend.sh
./start_frontend.sh
```

#### ✅ Opsi 3: Manual
**Terminal 1 - Backend:**
```bash
cd /Users/em/web/trader-ai-agent/backend
python3 minimal_server.py
```

**Terminal 2 - Frontend:**
```bash
cd /Users/em/web/trader-ai-agent/frontend
npm run dev
```

### 📱 Akses Aplikasi
- **Frontend**: http://localhost:3000
- **AI Chat**: http://localhost:3000/chat  
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### ✅ Test Koneksi

#### Test Backend:
```bash
curl http://localhost:8000/health
```

#### Test Chat API:
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test"}'
```

### 🔧 Troubleshooting

#### ❌ Port sudah digunakan:
```bash
# Kill port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill port 3000 (frontend)  
lsof -ti:3000 | xargs kill -9
```

#### ❌ Dependencies error:
```bash
# Backend
cd backend && pip3 install -r requirements.txt

# Frontend  
cd frontend && rm -rf node_modules && npm install
```

#### ❌ Permission denied pada script:
```bash
chmod +x *.sh
```

### 🎮 Fitur Yang Bisa Ditest

1. **Buka Browser**: http://localhost:3000/chat
2. **Test Chat**: Ketik pertanyaan tentang trading
3. **Test Format**: Lihat response AI dengan formatting yang baik
4. **Test Theme**: Toggle light/dark mode
5. **Test Suggestions**: Klik suggestion buttons

### 📊 Expected Behavior

**Backend Server Log:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Frontend Server Log:**
```
▲ Next.js 15.5.3 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

**Chat Response Example:**
- Formatted dengan bold text
- Bullet points yang rapi
- Warning boxes untuk risk
- Suggestions yang relevan

### 🔴 Stop Servers

**Jika menggunakan script otomatis:**
- Tekan `Ctrl+C` di terminal

**Jika manual:**
- Tekan `Ctrl+C` di masing-masing terminal
- Atau jalankan: `lsof -ti:8000 | xargs kill -9 && lsof -ti:3000 | xargs kill -9`
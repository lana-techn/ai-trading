# NousTrade — Presentasi & Poster Lomba

Dokumen ini berisi:
- Outline PPT (slide-by-slide) untuk presentasi lomba
- Naskah konten Poster siap pakai
- Ringkasan perintah demo cepat

Sumber materi diambil dari kode dan dokumentasi dalam repo ini: Next.js (frontend), NestJS (backend), skema database Supabase, serta README dan catatan performa.

====================================================
A. Outline PPT (Slide-by-Slide)
====================================================

Slide 1 — Judul & Tagline
- Judul: NousTrade — Hybrid Intelligence Platform
- Tagline: Analis pasar real-time dengan AI untuk crypto, forex, dan saham
- Logo/Identitas tim: [Nama Tim Anda]
- Tautan demo/repo: [https://github.com/your/repo] (ganti sesuai)

Slide 2 — Masalah yang Ingin Diselesaikan
- Informasi pasar keuangan sangat besar dan cepat berubah
- Trader kesulitan menggabungkan data harga, indikator teknikal, dan insight AI secara real-time
- Butuh sarana analisis yang cepat, akurat, dan mudah digunakan

Slide 3 — Solusi (Ringkasan)
- Platform web yang menggabungkan data pasar, indikator teknikal, dan analisis AI
- Antarmuka chat untuk tanya-jawab natural language + unggah gambar chart untuk dianalisis
- Dashboard, charts interaktif, portfolio tracking, dan watchlist

Slide 4 — Fitur Utama (User-Facing)
- Real-time Market Analysis dan Live Price
- Chat dengan AI untuk insight trading (text + unggah gambar chart)
- Interactive Charts dengan indikator teknikal
- Dashboard & Portfolio Tracking
- Autentikasi pengguna (Clerk) dan WebSocket untuk update real-time

Slide 5 — Arsitektur Tingkat Tinggi
- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS
- Backend: NestJS 10, TypeORM, Socket.IO
- Data: TypeORM (SQLite/Postgres), Supabase (penyimpanan objek & RLS untuk data aplikasi)
- Integrasi eksternal: Gemini API, Alpha Vantage (market data)
- Komunikasi: REST API berversioning di /api/v1

Diagram ASCII (Arsitektur):
```
[Browser/Client]
      |
      v
[Next.js Frontend]
  - Routes: /, /chat, /analysis, /dashboard, ...
  - Auth: Clerk
  - Axios -> ${NEXT_PUBLIC_API_URL}/api/v1
      |
      v
[NestJS Backend]
  - Modules: Ai, Analysis, MarketData, Chat, Tutorials,
             Audit, Health, Websocket
  - CacheInterceptor (TTL per route)
  - ScheduleModule (jobs)
      |
      |  (TypeORM)
      v
[DB: Postgres/SQLite]

      +-----------------------------+
      |        Supabase             |
      |  - Storage (chart-images)   |
      |  - Tables (chat, portfolio) |
      |  - RLS Policies             |
      +-----------------------------+

      +-----------------------------+
      | External APIs               |
      | - Alpha Vantage (market)    |
      | - Gemini API (AI)           |
      +-----------------------------+
```

Slide 6 — Frontend (Detail Teknis)
- Struktur: app/ (halaman), components/, lib/
- Autentikasi: @clerk/nextjs
- Client API: frontend/lib/api.ts (axios) -> baseURL: ${NEXT_PUBLIC_API_URL:-http://localhost:8000}/api/v1
- Halaman utama: /, /chat, /analysis, /dashboard, /portfolio, /trading, /charts, /settings, /tutorials, /debug
- Optimasi performa: optimizePackageImports, splitChunks, image optimization, cache headers di middleware

Slide 7 — Backend (Detail Teknis)
- NestJS AppModule memuat modul: Ai, Analysis, MarketData, Chat, Tutorials, Audit, Health, Websocket
- ConfigModule global memetakan env (app, database, CORS, marketData, chat, ai)
- DatabaseModule: otomatis memilih SQLite/Postgres, autoLoadEntities, synchronize: true
- CacheInterceptor global (per-route TTL)
- Endpoint utama: /health, /analyze, /market-data/:symbol, /price/:symbol, /symbols, /chat, /chat/upload-image, /chat/history/:session

Slide 8 — Data & Keamanan
- TypeORM untuk entitas aplikasi (sinkronisasi skema otomatis di dev)
- Supabase schema (database/schema.sql) untuk: uploaded_images, chat_sessions, chat_messages, watchlists, portfolio holdings
- Row Level Security (RLS) aktif dengan kebijakan per tabel

Slide 9 — Alur Pemakaian Pengguna
- Login (Clerk) -> pilih halaman (Dashboard/Chat/Charts)
- Chat: kirim pertanyaan atau unggah gambar chart -> backend AI analisis -> tampil insight
- Charts: lihat candlestick & indikator
- Portfolio: pantau posisi & performa

Diagram ASCII (Alur Chat & Analisis Gambar):
```
User -> Frontend (/chat) -> POST /api/v1/chat
                       -> POST /api/v1/chat/upload-image

Sequence (upload-image):
[User]
  | upload file + context
  v
[Frontend]
  | multipart/form-data
  v
[Backend /chat/upload-image]
  | validate -> analyze (AI)
  | persist -> Supabase (image, metadata)
  v
[Response]
  | analysis_result + suggestions
  v
[Frontend UI updates]
```

Slide 10 — Demo Lokal (Singkat)
- Install: pnpm install
- Jalankan dev: pnpm dev (frontend :3000, backend :8000)
- Smoke test integrasi: ./test-chat.sh
- Catatan env: NEXT_PUBLIC_API_URL (default http://localhost:8000)

Slide 11 — Hasil & Performa (Ringkas)
- Frontend: code splitting, image optimization (WebP/AVIF), cache headers
- Backend: compression, helmet, cache interceptor, graceful shutdown
- Analisis build/bundle: pnpm analyze, pnpm analyze:bundle, pnpm lighthouse

Slide 12 — Kebaruan & Dampak
- UI chat-driven untuk analisis pasar, termasuk analisis gambar chart dengan AI
- Integrasi indikator teknikal + data pasar + insight AI
- Didesain untuk respons cepat dan skalabilitas

Slide 13 — Rencana Lanjutan
- CDN untuk aset statis, Edge Functions, Redis Cache
- Indeks database lanjutan, service worker, optimasi WebSocket
- Integrasi lebih banyak sumber data pasar

Slide 14 — Penutup
- Ringkasan nilai: cepat, informatif, mudah dipakai untuk keputusan trading
- Ajak juri mencoba demo dan melihat kode di repo
- Kontak tim / QR Code

Tambahan: Versi Singkat (8 Slide) — Jika durasi presentasi ketat
1) Judul & Masalah
2) Solusi & Fitur Kunci
3) Arsitektur (diagram singkat)
4) Demo Local (perintah + URL)
5) Alur Pengguna (diagram singkat)
6) Hasil & Performa
7) Kebaruan & Rencana Lanjut
8) Penutup & Call-to-Action

====================================================
B. Naskah Konten Poster (Siap Pakai)
====================================================

Judul Besar
NousTrade — Hybrid Intelligence Platform

Sub-Tagline
Analisis pasar real-time berbasis AI untuk crypto, forex, dan saham

Masalah
- Data pasar besar dan dinamis menyulitkan analisis cepat
- Trader perlu menggabungkan indikator teknikal, data real-time, dan insight AI dalam satu tempat

Solusi
- Web app yang menggabungkan data pasar, indikator teknikal, dan analisis AI melalui antarmuka chat dan dashboard
- Unggah gambar chart untuk dianalisis AI

Fitur Kunci
- Real-time Market Analysis & Live Price
- Chat dengan AI (text + gambar chart)
- Charts interaktif dan indikator teknikal
- Dashboard, Portfolio Tracking, dan Watchlist
- Login aman dengan Clerk; update real-time via WebSocket

Arsitektur (Ringkas)
- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS
- Backend: NestJS 10, TypeORM, Socket.IO
- Data: TypeORM (SQLite/Postgres), Supabase (RLS, storage objek)
- Integrasi: Gemini API, Alpha Vantage (market data)
- API: REST berprefix /api/v1

Diagram ASCII (untuk Poster):
```
[Client]
  |
  v
[Next.js Frontend] -- Axios --> /api/v1 --+--> [NestJS Backend]
                                           |       |  TypeORM
                                           |       v
                                           |   [DB: PG/SQLite]
                                           |
                                           +--> [Supabase Storage/RLS]
                                           +--> [Alpha Vantage]
                                           +--> [Gemini API]
```

Cara Kerja (Alur)
1) Login -> 2) Pilih Chat/Charts/Dashboard -> 3) Kirim pertanyaan atau unggah gambar chart -> 4) Backend proses data & AI -> 5) Insight dan visualisasi

Hasil & Performa
- Optimasi bundling, splitChunks, image optimization, cache headers
- Backend: compression, helmet, cache per-route, graceful shutdown
- Tools analisis: pnpm analyze, pnpm analyze:bundle, pnpm lighthouse

Keamanan & Privasi
- Middleware keamanan (headers) di frontend; helmet di backend
- Kebijakan RLS pada tabel Supabase
- Variabel lingkungan untuk kunci API dan konfigurasi

Teknologi Inti
- Next.js, React, Tailwind CSS
- NestJS, TypeORM, Socket.IO
- Supabase, Axios
- Gemini API, Alpha Vantage

Cara Mencoba (Lokal)
- Prasyarat: Node >= 18, pnpm >= 8
- Install: pnpm install
- Jalankan: pnpm dev (Frontend: http://localhost:3000, Backend: http://localhost:8000)
- Smoke test: ./test-chat.sh

Kontak / QR Code
- [Nama Tim / Institusi]
- [Email / Media Sosial]
- [QR ke repo/demo]

====================================================
C. Lampiran: Ringkasan Perintah Penting
====================================================

Pengembangan
- Install: pnpm install
- Dev semua: pnpm dev
- Dev per paket: pnpm dev:frontend | pnpm dev:backend

Build & Start
- Build: pnpm build
- Start: pnpm start

Lint & Format
- Lint semua: pnpm lint
- Lint per paket: pnpm --filter frontend lint | pnpm --filter backend lint
- Format backend: pnpm --filter backend format

Testing (Backend — Jest)
- Semua: pnpm --filter backend test
- Watch: pnpm --filter backend test:watch
- Single file: pnpm --filter backend test -- src/path/to/file.spec.ts
- Filter nama: pnpm --filter backend test -- -t "pattern"
- Coverage: pnpm --filter backend test:cov

Analisis Performa
- Analisis build: pnpm analyze
- Bundle analyzer (frontend): pnpm analyze:bundle
- Lighthouse (butuh frontend jalan): pnpm lighthouse
- Bersihkan cache build: pnpm clean

Demo Integrasi
- ./test-chat.sh

====================================================
D. Referensi Teknis (Singkat)
====================================================

Endpoint utama (dipakai oleh frontend/lib/api.ts)
- GET /api/v1/health
- POST /api/v1/analyze
- GET /api/v1/market-data/:symbol
- GET /api/v1/price/:symbol
- GET /api/v1/symbols
- POST /api/v1/chat
- POST /api/v1/chat/upload-image
- GET /api/v1/chat/history/:session

Catatan Konfigurasi
- NEXT_PUBLIC_API_URL (default http://localhost:8000)
- Kunci AI: GEMINI_API_KEY (opsional: OPENROUTER_API_KEY)
- Alpha Vantage key (opsional)
- Database: DATABASE_URL atau fallback SQLite ./data/trader-ai.sqlite

Struktur Modul Backend (intisari)
- Ai, Analysis, MarketData, Chat, Tutorials, Audit, Health, Websocket
- CacheInterceptor global; ConfigModule global; ScheduleModule

Catatan
- README menyebut db:migrate/db:seed, namun script tersebut tidak tersedia; skema dikendalikan via TypeORM synchronize (Nest) dan Supabase schema.sql
- Deskripsi root package.json menyebut “FastAPI”, namun backend aktual adalah NestJS

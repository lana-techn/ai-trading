# 🚀 AI Trading Agent - Development Guide

## ✅ Super Simple Setup!

### Before (Dulu):
```bash
chmod +x dev-simple.sh
./dev-simple.sh
```

### Now (Sekarang):
```bash
# 1. Install dependencies
pnpm install

# 2. Jalankan development server
pnpm dev
```

**Selesai!** 🎉
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

## Commands yang Tersedia

### Development
```bash
# Jalankan keduanya (frontend + backend)
pnpm dev

# Atau jalankan terpisah:
pnpm dev:frontend    # Hanya frontend di port 3000
pnpm dev:backend     # Hanya backend di port 8000
```

### Build & Production
```bash
pnpm build          # Build keduanya
pnpm start          # Jalankan production build
```

### Maintenance
```bash
pnpm clean          # Bersihkan cache
pnpm lint           # Check code quality
```

## Struktur Project
```
trader-ai-agent/
├── frontend/       # Next.js app
├── backend/        # NestJS API
└── package.json    # Root workspace config
```

## Kenapa Tidak Perlu Script Bash?

**Sebelumnya:** `./dev-simple.sh`
- Perlu executable permissions
- Platform-specific (bash)
- File tambahan yang perlu dikelola

**Sekarang:** `pnpm dev`
- ✅ Cross-platform (Windows, Mac, Linux)
- ✅ Standard pnpm workspace
- ✅ Otomatis restart saat file berubah
- ✅ Colored logs untuk debugging
- ✅ Satu command untuk semua

## Troubleshooting

### Port sudah digunakan?
```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9

# Kill process di port 8000  
lsof -ti:8000 | xargs kill -9
```

### Cache issues?
```bash
pnpm clean
pnpm install
pnpm dev
```

### Dependencies error?
```bash
pnpm install --force
```

---
**Simple is better!** Sekarang Anda cukup `pnpm dev` dan semuanya jalan! 🚀
# 🚀 AI Trading Agent

> **Advanced AI-powered trading platform with hybrid Gemini integration for comprehensive market analysis**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-00a393)](https://fastapi.tiangolo.com/)

## ✨ Features

### 🤖 **AI-Powered Chat Assistant**
- **Gemini AI Integration** - Advanced conversational AI for trading education and insights
- **Natural Language Processing** - Ask questions in plain English about trading concepts
- **Educational Support** - Learn about technical indicators, risk management, and trading strategies
- **Real-time Responses** - Instant AI-powered analysis and explanations

### 📊 **Advanced Analysis**
- **Hybrid AI System** - Combines Qwen technical analysis with Gemini visual intelligence
- **Multi-Timeframe Analysis** - Support for various trading timeframes (1m to 1D)
- **Technical Indicators** - RSI, MACD, Moving Averages, Bollinger Bands, and more
- **Risk Assessment** - Built-in risk management recommendations

### 🎨 **Modern Interface**
- **Next.js 15** - Latest React framework with Turbopack
- **Tailwind CSS** - Utility-first CSS with full theme support
- **Light/Dark Mode** - Seamless theme switching
- **Responsive Design** - Works perfectly on all devices
- **Professional UI** - Clean, modern design optimized for traders

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lana-techn/ai-trading.git
   cd ai-trading
   ```

2. **Install dependencies**
   ```bash
   # Option 1: Automated installation (Recommended)
   pnpm install:all
   
   # Option 2: Manual installation
   # Backend dependencies
   cd backend
   pip3 install -r requirements.txt
   pip3 install pydantic-settings seaborn
   
   # Frontend dependencies
   cd ../frontend
   pnpm install
   cd ..
   ```

3. **Start the application**
   ```bash
   # Option 1: Optimized development script (Recommended)
   ./dev.sh
   
   # Option 2: Using pnpm scripts
   pnpm dev
   
   # Option 3: Start individual services
   ./dev.sh frontend    # Frontend only
   ./dev.sh backend     # Backend only
   
   # Option 4: Legacy scripts (still available)
   ./start_servers.sh
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **AI Chat**: http://localhost:3000/chat
   - **API Documentation**: http://localhost:8000/docs

## 🎯 Usage Examples

### Basic Chat Interaction
```
User: "What is RSI and how do I use it?"

AI: **Relative Strength Index (RSI)** is a momentum indicator that measures 
the speed and magnitude of price changes.

• **Range**: 0-100 scale
• **Overbought**: Values above 70 suggest potential selling pressure
• **Oversold**: Values below 30 suggest potential buying opportunities
• **Best Practice**: Use RSI in conjunction with other indicators

⚠️ **Risk Warning**: Trading involves significant risk. Never invest more than you can afford to lose.
```

## 🛠️ Configuration

### Environment Setup

Create `.env` file in the backend directory:
```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
USE_LOCAL_QWEN=false

# Server Configuration
DEBUG=true
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
```

## ⚡ Available Commands

### Development Scripts
```bash
# Start development environment
./dev.sh                 # Start both frontend and backend
pnpm dev                 # Alternative using pnpm

# Individual services
./dev.sh frontend        # Start only frontend (port 3000)
./dev.sh backend         # Start only backend (port 8000)

# Utility commands
./dev.sh status          # Check server status
./dev.sh stop            # Stop all servers
./dev.sh clean           # Clean dependencies and restart
./dev.sh help            # Show help message

# Package management
pnpm install:all         # Install both backend and frontend deps
pnpm frontend:install    # Install only frontend dependencies
pnpm backend:install     # Install only backend dependencies

# Build and production
pnpm build               # Build frontend for production
pnpm start               # Start production build
pnpm lint                # Run linting
pnpm test                # Run tests
```

### Quick Testing
```bash
# Test your setup
./scripts/test_setup.sh   # Verify migration and configuration
```

## 📚 Trading Education

### 🎯 Ready for Real Trading?
Transition from paper trading to real money with comprehensive guidance:
- [Ready for Real Trading Guide](docs/READY_FOR_REAL_TRADING.md) - Complete transition strategy
- [Risk Management Guide](docs/RISK_MANAGEMENT_GUIDE.md) - Internal comprehensive risk education  
- [External Risk Resources](docs/EXTERNAL_RISK_RESOURCES.md) - Curated professional resources
- [Quick Start Guide](docs/QUICKSTART.md) - Get up and running fast

> ⚠️ **Trading Disclaimer**: All trading involves significant financial risk. These educational materials are for informational purposes only. Never invest more than you can afford to lose.

---

## 🔧 Development

### Project Structure
```
ai-trading-agent/
├── 📁 backend/              # FastAPI backend
│   ├── 📁 app/             # Main application
│   │   ├── 📁 core/        # Core configurations  
│   │   ├── 📁 services/    # Business logic services
│   │   └── 📁 utils/       # Utility functions
│   ├── minimal_server.py   # Development server
│   └── requirements.txt    # Python dependencies
├── 📁 frontend/            # Next.js frontend
│   ├── 📁 app/            # Next.js 15 app directory
│   ├── 📁 components/     # React components (optimized)
│   │   ├── 📁 charts/     # Trading charts (3 components)
│   │   ├── 📁 chat/       # AI chat interface
│   │   └── 📁 ui/         # Base UI components
│   └── 📁 lib/            # Utilities and API
├── 📁 docs/               # Documentation
│   ├── SETUP_GUIDE.md     # Detailed setup
│   └── QUICKSTART.md      # Quick start guide  
├── 📁 scripts/            # Utility scripts
│   └── test_setup.sh      # Setup verification
├── dev.sh                 # 🌟 Main development script
├── package.json           # Root workspace config
├── pnpm-workspace.yaml    # pnpm workspace
├── README.md              # Main documentation
├── Warp.md               # 🤖 AI assistant guide
└── .gitignore            # Git ignore rules
```

### ✨ Project Optimizations

**🧹 Cleaned Structure:**
- Removed 12+ redundant chart components
- Consolidated scripts into organized folders
- Removed debug files and build artifacts
- Optimized documentation structure

**⚡ Performance Improvements:**
- Migrated to pnpm for faster installs
- Enhanced development scripts with process management
- Cleaned build caches and temporary files

### Testing

```bash
# Test backend health
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test"}'
```

## 🎨 UI/UX Features

- **🌙 Dark/Light Mode**: Seamless theme switching
- **📱 Responsive Design**: Works on all device sizes  
- **⚡ Fast Loading**: Optimized with Next.js and Turbopack
- **💬 Smart Chat**: Advanced message formatting and suggestions
- **⚠️ Risk Warnings**: Built-in trading risk notifications

## 🚦 Roadmap

### Phase 1: Core Chat (✅ Complete)
- [x] AI Chat Interface
- [x] Gemini Integration
- [x] Theme Support
- [x] Message Formatting

### Phase 2: Enhanced Analysis (📅 Planned)
- [ ] Full technical analysis integration
- [ ] Chart visualization
- [ ] Real-time market data
- [ ] Portfolio tracking

## ⚠️ Disclaimer

This software is for educational and informational purposes only. Trading involves significant financial risk, and you should carefully consider your financial situation and consult with financial professionals before making trading decisions.

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the trading community**
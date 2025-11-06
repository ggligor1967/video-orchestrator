# Quick Start Guide

## 🚀 For End Users

### Installation (Windows)

1. **Download** the latest MSI installer from [Releases](https://github.com/YOUR_ORG/video-orchestrator/releases)

2. **Run** the installer:
   ```
   video-orchestrator-setup.msi
   ```

3. **Follow** the installation wizard

4. **Launch** Video Orchestrator from Start Menu

### First-Time Setup

1. **Configure API Keys** (optional):
   - Open Settings
   - Add OpenAI or Google Gemini API key for AI script generation
   - Add Pexels/Pixabay API key for stock media

2. **Download Required Tools**:
   - The app will prompt you to download FFmpeg, Piper, and Whisper
   - These are required for video processing

3. **Create Your First Video**:
   - Click "New Project"
   - Follow the tab-by-tab workflow
   - Export your video!

---

## 👨‍💻 For Developers

### Prerequisites

Install these first:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm** - Install with: `npm install -g pnpm`
- **Rust** - [Download](https://rustup.rs/) (for Tauri)
- **Git** - [Download](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_ORG/video-orchestrator.git
cd video-orchestrator

# 2. Install dependencies
pnpm install

# 3. Build shared packages
pnpm --filter @video-orchestrator/shared build

# 4. Set up environment variables
cp apps/orchestrator/.env.example apps/orchestrator/.env
# Edit .env and add your API keys

# 5. Download external tools
powershell -File scripts/download-tools.ps1

# 6. Start development servers
pnpm dev
```

### Development Commands

```bash
# Start both frontend and backend
pnpm dev

# Start only backend (port 4545)
pnpm --filter @app/orchestrator dev

# Start only frontend (port 5173)
pnpm --filter @app/ui dev

# Run tests
pnpm test:all

# Lint code
pnpm lint

# Build for production
pnpm build

# Build Tauri desktop app
pnpm --filter @app/ui tauri build
```

### Project Structure

```
video-orchestrator/
├── apps/
│   ├── orchestrator/       # Backend (Express + Node.js)
│   └── ui/                 # Frontend (Tauri + Svelte)
├── packages/
│   └── shared/             # Shared types and utilities
├── tools/                  # External binaries (FFmpeg, Piper, etc.)
├── tests/                  # Test suites
└── scripts/                # Build and setup scripts
```

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**

3. **Test your changes**:
   ```bash
   pnpm test:all
   pnpm lint
   ```

4. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/my-feature
   ```

### Troubleshooting

#### Backend won't start

```bash
# Check if port 4545 is already in use
netstat -ano | findstr :4545

# Kill the process if needed
taskkill /PID <process_id> /F
```

#### Frontend won't connect to backend

```bash
# Verify backend is running
curl http://127.0.0.1:4545/health

# Check VITE_API_URL in apps/ui/.env
```

#### Build fails

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

#### Tests fail

```bash
# Check if backend is running
# Tests expect backend on port 4545
pnpm --filter @app/orchestrator dev

# Run tests in another terminal
pnpm test:all
```

---

## 🔧 Configuration

### Environment Variables

**Backend** (`apps/orchestrator/.env`):

```bash
# Server
PORT=4545
NODE_ENV=development

# AI Services (optional)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Stock Media (optional)
PEXELS_API_KEY=...
PIXABAY_API_KEY=...

# Paths
TOOLS_BASE_PATH=./tools
DATA_BASE_PATH=./data
```

**Frontend** (`apps/ui/.env`):

```bash
# API endpoint
VITE_API_URL=http://127.0.0.1:4545
```

### Tool Paths

External tools are expected at:

- `tools/ffmpeg/ffmpeg.exe`
- `tools/piper/piper.exe`
- `tools/whisper/main.exe`
- `tools/godot/Godot_v4.x.x-stable_win64.exe` (optional)

Download script: `scripts/download-tools.ps1`

---

## 📚 Next Steps

- Read the [full README](README.md)
- Check out [CONTRIBUTING.md](CONTRIBUTING.md)
- Review [ARCHITECTURE.md](ARCHITECTURE.md)
- Browse [API documentation](API.md)

---

## 💬 Getting Help

- **Documentation**: Check the docs in this repo
- **Issues**: [GitHub Issues](https://github.com/YOUR_ORG/video-orchestrator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_ORG/video-orchestrator/discussions)

---

**Happy creating! 🎬✨**

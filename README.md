# PRReviewPilot 🚀

> **Production AI Code Review Engine for GitHub & Bitbucket Cloud**
> Autonomous code review, security vulnerability detection, and inline pull request comments.

---

## 🌟 Key Features

- **Multi-Provider Git Support:** Native integration with both **GitHub** and **Bitbucket Cloud** via unified provider abstraction.
- **Deep Static & Semantic Analysis:** Automated risk assessment, vulnerability scanning, bug risk detection, and performance profiling.
- **Interactive Inline PR Comments:** Automatically posts inline actionable suggestions (`suggestion` blocks) directly to the PR lines on GitHub and Bitbucket.
- **Unified Organization Dashboard:** Monitor repositories across multiple Git providers in a single pane of glass.
- **Custom Review Rules & Strictness:** Configure per-repository review policies (`lenient`, `balanced`, `strict`) and custom engineering guidelines.

---

## 🏗️ Architecture

```
PRReviewPilot/
├── apps/
│   ├── api/             # Node.js (Express + Sequelize) REST API & Provider Abstraction
│   ├── ai-service/      # Python (FastAPI + OpenAI) Code Review Agent
│   └── web/             # Next.js 14 Dashboard (React 18, TailwindCSS, Lucide)
├── docker-compose.local.yml # PostgreSQL 16 & Redis 7
├── .env.example
└── README.md
```

---

## 🚀 Quickstart (Local Development)

### 1. Start Database & Redis
```bash
docker compose -f docker-compose.local.yml up -d
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in root and configure:
- `OPENAI_API_KEY`: Your OpenAI API key for code review analysis
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: For GitHub OAuth
- `BITBUCKET_CLIENT_ID` & `BITBUCKET_CLIENT_SECRET`: For Bitbucket Cloud OAuth

### 3. Start AI Service (Python FastAPI)
```bash
cd apps/ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

### 4. Start API Server (Node.js Express)
```bash
cd apps/api
npm install
npm run dev
```

### 5. Start Web Dashboard (Next.js)
```bash
cd apps/web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the PRReviewPilot Dashboard!

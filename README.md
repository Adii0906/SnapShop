# SnapShop

> Transform printed product pamphlets and catalogs into a ready-to-use digital storefront.

## Overview

SnapShop is an AI-powered platform that helps local sellers convert printed pamphlets and product catalogs into editable online storefronts. Instead of manually entering every product, upload a pamphlet, review the extracted information, and publish the products through a digital storefront. The application handles the complete workflow from **catalog ingestion → product extraction → seller review → database storage → storefront generation**.

## Features

- Upload product pamphlets and catalogs
- Extract structured business and product information
- Review and edit extracted products before publishing
- Manage product pricing and stock
- Create and manage offers
- Generate a digital storefront automatically
- Seller dashboard for managing store information
- SQLite database for local development
- Demo mode for running the application without external AI API keys

## Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI
- **Database:** SQLite
- **Processing:** OCR + AI-powered extraction (with demo mode)

### Install

1. Clone and navigate:
```bash
git clone https://github.com/Adii0906/SnapShop.git
cd SnapShop
```

2. Backend setup:
```bash
cd apps/api
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
# Unix: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

3. Frontend setup:
```bash
cd ../../web
npm install
cp .env.example .env.local
```

## Run

**Terminal 1 (Backend):**
```bash
cd apps/api
source .venv/bin/activate  # or .\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Health check: http://localhost:8000/health

**Terminal 2 (Frontend):**
```bash
cd web
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Open http://localhost:3000


## Project Structure

```text
apps/
└── api/              # FastAPI backend
    ├── app/
    │   ├── core/     # Settings & tracing
    │   ├── db/       # DB models & database setup
    │   ├── routers/  # API Routers
    │   ├── schemas/  # Pydantic request/response schemas
    │   └── services/ # AI and business logic
    └── requirements.txt
web/                  # Next.js frontend
    ├── app/
    ├── components/
    └── package.json
```

---

## Setup & Installation

### Prerequisites

```bash
python --version  # 3.10+
node --version    # 18+
npm --version
```

---

## Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: describe change"
git push origin feature/your-feature
```

## License
- **License:** Development/demo purposes under process

# 🛍️ Smart Autonomous E-Commerce Platform

<div align="center">

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![CrewAI](https://img.shields.io/badge/CrewAI-Multi--Agent-FF4B4B.svg?style=for-the-badge&logo=robot&logoColor=white)](https://www.crewai.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-FF6F00.svg?style=for-the-badge&logo=database&logoColor=white)](https://www.trychroma.com)
[![Groq LLaMA 3.3](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A next-generation, AI-native full-stack e-commerce ecosystem powered by CrewAI Multi-Agent intelligence, ChromaDB Vector RAG, FastAPI asynchronous backend, and a modern React 18 frontend.</b>
</p>

[Key Features](#-key-features) •
[Architecture](#-system-architecture) •
[Tech Stack](#-technology-stack) •
[Quick Start](#-quick-start-guide) •
[Environment Variables](#-environment-variables) •
[API Documentation](#-api-endpoints) •
[Admin Portal](#-admin-portal)

---

</div>

## 🌟 Key Features

### 🤖 Multi-Agent Autonomous AI Layer
- **CrewAI Orchestration**: Specialized autonomous agent team powered by Groq's high-speed **LLaMA 3.3 70B Versatile** model.
- **Agent Roles**:
  - 🎯 **Coordinator Agent**: Understands buyer intent, routes inquiries, and synthesizes structured recommendations.
  - 🔎 **Semantic Search Agent**: Retrieves catalog items matching natural-language semantic prompts.
  - 💡 **Recommendation Agent**: Performs personalized suggestions based on browsing history, category affinities, and cart contents.
  - 🏷️ **Dynamic Pricing & Coupon Agent**: Calculates real-time discount offers, promotional codes, and bundles.
  - ⭐ **Sentiment & Review Agent**: Analyzes customer feedback and provides concise sentiment summaries.
- **Graceful Fallback**: Deterministic fallback engine operates seamlessly even if LLM API keys are unset.

### 🔍 ChromaDB Vector RAG Search
- **Semantic Product Retrieval**: Vector embeddings index product titles, descriptions, categories, and attributes.
- **Real-Time Index Synchronization**: Background indexer automatically updates vector embeddings upon product creation, update, or deletion.
- **On-Demand Vector Resync**: Dedicated admin endpoint to trigger catalog re-indexing.

### 💬 Conversational AI Shopping Assistant
- **Floating Interactive Widget**: Always-accessible AI companion across the storefront.
- **Context-Aware Assistance**: Answers questions, provides direct product links, calculates discounts, and suggests accessories.
- **Rich Interactive UI**: Supports quick prompt chips, markdown formatting, loading indicators, and error resilience.

### 🛒 Complete E-Commerce Storefront
- **Modern Responsive Design**: Built with React 18, React Router v6, and custom modern UI tokens.
- **Catalog & Category Navigation**: Filterable product lists, category banners, dynamic sort options, and search bar.
- **Cart & Wishlist**: Real-time cart state management, persistent wishlist, quantity adjustments, and stock validation.
- **Checkout & Order Flow**: Multi-step checkout, payment method selection, order tracking, and order history.
- **Ratings & Reviews**: User submission of star ratings and verified product feedback.

### 🛡️ Role-Based Admin Dashboard
- **Catalog Management**: Full CRUD for products (with image URLs, pricing, inventory, categories) and category structures.
- **Order Processing**: Live order status updates (Placed, Processing, Shipped, Delivered, Cancelled).
- **User & Admin Management**: Account administration, role assignments, and permission controls.
- **AI Diagnostics**: Manual trigger for ChromaDB vector embeddings rebuild.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend (React 18 + Vite)"]
        UI[Storefront UI & Router]
        AIWidget[AI Shopping Assistant Widget]
        AdminUI[Admin Dashboard]
    end

    subgraph API["FastAPI Backend (Port 8000)"]
        Router[API Gateway / Router]
        Auth[JWT & Bcrypt Security]
        Endpoints[Products / Orders / Cart / Reviews]
        DiscoveryAPI["/api/discovery/chat"]
    end

    subgraph DatabaseLayer["Data & Persistence"]
        DB[(SQLite / PostgreSQL via SQLAlchemy Async)]
    end

    subgraph AI_Engine["Autonomous AI & Vector Layer"]
        CrewAI[CrewAI Multi-Agent System]
        GroqLLM[Groq LLaMA 3.3 70B]
        ChromaStore[(ChromaDB Vector Store)]
        AutoIndexer[Real-time Vector Sync Service]
    end

    Client -->|REST & JSON| Router
    Router --> Auth
    Router --> Endpoints
    Router --> DiscoveryAPI

    Endpoints <--> DB
    Endpoints -->|Trigger Sync| AutoIndexer
    AutoIndexer --> ChromaStore

    DiscoveryAPI <--> CrewAI
    CrewAI <--> GroqLLM
    CrewAI <--> ChromaStore
    CrewAI <--> DB
```

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Bootstrap 5, Modern Vanilla CSS Design System |
| **Backend API** | FastAPI, Python 3.12+, Pydantic v2, Pydantic Settings, Python-Jose (JWT), Passlib (Bcrypt) |
| **Database & ORM** | SQLAlchemy 2.0 (Async), aiosqlite (SQLite default), PostgreSQL compatible (asyncpg) |
| **AI & Multi-Agent** | CrewAI 0.100+, LangChain Groq, Groq API (`llama-3.3-70b-versatile`) |
| **Vector Search / RAG** | ChromaDB (Persistent Vector Database, Cosine Similarity) |
| **Package & Dev Tools** | `uv` (Astral Python package manager), npm, Vite Dev Server, Pytest Asyncio |

---

## 📁 Repository Structure

```text
E-Commerce-Website/
├── backend/                        # FastAPI Backend Application
│   ├── ai/                         # Autonomous AI & Vector Search Layer
│   │   ├── agents.py               # CrewAI Specialist Agents & Crew Definitions
│   │   ├── discovery.py            # Conversational Discovery Orchestrator & Fallback
│   │   ├── indexer.py              # Product-to-Vector Indexer
│   │   ├── llm.py                  # Groq LLM Client Provider
│   │   ├── rag.py                  # ChromaDB Vector Store Client & Embeddings
│   │   └── tools.py                # Database & Vector Search Tools for Agents
│   ├── app/                        # Core Application
│   │   ├── api/                    # API Route Handlers (Auth, Cart, Orders, Products, etc.)
│   │   ├── core/                   # Security, JWT tokens, Settings & Configuration
│   │   ├── db/                     # Async Database Session, Base Model, Seed Admin
│   │   ├── models/                 # SQLAlchemy 2.0 ORM Models
│   │   ├── schemas/                # Pydantic v2 Request/Response Validation Schemas
│   │   └── services/               # Reusable Business Logic Services
│   ├── chroma_db/                  # Local Persistent ChromaDB Vector Store
│   ├── tests/                      # Pytest Async Test Suite
│   ├── pyproject.toml              # Python Dependency Manifest
│   ├── uv.lock                     # Locked Dependency Tree
│   └── .env.example                # Backend Environment Template
├── frontend/                       # React 18 Single Page Application
│   ├── src/
│   │   ├── api/                    # Axios / Fetch API Client Wrappers
│   │   ├── components/             # Reusable UI (Navbar, Footer, ProductCard, AiAssistantWidget)
│   │   ├── context/                # Global Auth, Cart, and Wishlist State Providers
│   │   ├── pages/                  # Storefront & Admin Views (Home, Catalog, Checkout, AdminDashboard)
│   │   ├── App.jsx                 # Routing & Top-Level Context Wrappers
│   │   ├── index.css               # Global Design System, Tokens, Animations & Glassmorphism
│   │   └── main.jsx                # React DOM Root Entry
│   ├── package.json                # Frontend Dependencies & Scripts
│   └── vite.config.js              # Vite Build Configuration
├── start.bat                       # Windows One-Click Dev Server Launcher
├── start.sh                        # Linux / macOS One-Click Dev Server Launcher
└── README.md                       # Comprehensive Project Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: `3.12+` installed ([python.org](https://www.python.org/downloads/))
- **Node.js**: `18.x` or `20.x` + `npm` installed ([nodejs.org](https://nodejs.org/))
- **uv** *(Recommended)*: Astral's fast Python package manager ([astral.sh/uv](https://docs.astral.sh/uv/)) or standard `pip`/`venv`

---

### Method 1: One-Click Launch (Recommended)

#### On Windows:
Double-click `start.bat` or run:
```cmd
start.bat
```

#### On macOS / Linux:
Make executable and run:
```bash
chmod +x start.sh
./start.sh
```

The launcher will automatically set up the virtual environment, install missing dependencies, and boot both servers:
- **Backend API**: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)
- **Frontend App**: `http://localhost:3000`

---

### Method 2: Manual Step-by-Step Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create environment configuration
cp .env.example .env

# Option A: Using uv (Recommended)
uv sync
uv run uvicorn app.main:app --reload --port 8000

# Option B: Using standard Python venv
python -m venv .venv
# Activate venv:
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 🔑 Environment Variables

Create a `backend/.env` file with the following variables:

```ini
# ---- Core Settings ----
DEBUG=false
SECRET_KEY=generate-a-strong-random-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ---- Database ----
# SQLite default:
DATABASE_URL=sqlite+aiosqlite:///./ecommerce.db
# PostgreSQL alternative:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/ecommerce

# ---- CORS Configuration ----
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# ---- AI & LLM (Groq & CrewAI) ----
# Obtain a free key from https://console.groq.com
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# ---- Vector Store (ChromaDB) ----
CHROMA_PERSIST_DIR=./chroma_db
CHROMA_COLLECTION=products
```

> [!TIP]
> If `GROQ_API_KEY` is left blank, the application will run seamlessly using deterministic fallback discovery logic. Adding your Groq API key enables the autonomous CrewAI multi-agent discovery crew.

---

## 🔐 Default Credentials

On initial startup, the database is seeded automatically with a default administrative account:

| Role | Email | Default Password | Access Level |
|---|---|---|---|
| **System Admin** | `admin@smartecommerce.com` | `admin` | Full Administrative & RAG controls |

> [!CAUTION]
> Always change default administrative credentials before deploying to a production environment.

---

## 📡 API Endpoints

FastAPI provides an interactive OpenAPI / Swagger UI at `http://localhost:8000/docs`.

### Core API Summary

| Group | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register new customer account |
| | `POST` | `/api/auth/login` | Authenticate customer & receive JWT |
| | `POST` | `/api/auth/admin-login` | Authenticate admin user |
| | `GET` | `/api/auth/me` | Retrieve authenticated user profile |
| **Products** | `GET` | `/api/products` | Paginated product list with category & search filters |
| | `GET` | `/api/products/{id}` | Retrieve individual product details |
| **Search** | `GET` | `/api/search?q={query}` | Hybrid Semantic (Vector) + SQL keyword search |
| **AI Discovery**| `POST` | `/api/discovery/chat` | Conversational Multi-Agent AI shopping assistant |
| **Cart** | `GET` | `/api/cart` | Get authenticated user's cart |
| | `POST` | `/api/cart/items` | Add or update product in cart |
| | `DELETE`| `/api/cart/items/{id}`| Remove item from cart |
| **Orders** | `GET` | `/api/orders` | List customer orders |
| | `POST` | `/api/orders` | Create new order from cart |
| | `GET` | `/api/orders/{id}` | Get specific order tracking details |
| **Wishlist** | `GET` | `/api/wishlist` | Retrieve customer wishlist |
| | `POST` | `/api/wishlist/toggle` | Add/remove product from wishlist |
| **Reviews** | `GET` | `/api/reviews/product/{id}`| List product reviews and ratings |
| | `POST` | `/api/reviews` | Submit new verified review |
| **Admin** | `GET/POST`| `/api/admin/products` | Manage product catalog |
| | `GET/PUT` | `/api/admin/orders` | Manage and update order statuses |
| | `POST` | `/api/admin/rag/resync` | Rebuild entire ChromaDB vector index |

---

## 🛠️ Testing & Verification

Run the asynchronous backend test suite using `pytest`:

```bash
cd backend
uv run pytest
# or
pytest
```

---

## 🤝 Contributing

Contributions, feature requests, and improvements are warmly welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m "feat: Add amazing new feature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and distributed under the **MIT License**. See the `LICENSE` file for more details.

---

<div align="center">
  <sub>Built with ❤️ by the Smart E-Commerce Development Team.</sub>
</div>

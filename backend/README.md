# Smart Autonomous E-commerce Platform — Backend

FastAPI + SQLAlchemy 2.0 (async) + Pydantic v2 + JWT auth + ChromaDB RAG + CrewAI agents.

## Requirements

- Python 3.12
- [uv](https://docs.astral.sh/uv/) (recommended)

## Setup

```bash
cp .env.example .env   # then set SECRET_KEY (and GROQ_API_KEY for AI agents)
uv sync --python /opt/homebrew/bin/python3.12   # or `uv sync`
uv run uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Environment variables (.env)

| Variable | Default | Purpose |
|---|---|---|
| `SECRET_KEY` | `change-me...` | JWT signing key (set a long random value) |
| `DATABASE_URL` | `sqlite+aiosqlite:///./ecommerce.db` | SQLAlchemy URL (SQLite now, PostgreSQL later) |
| `CORS_ORIGINS` | `["http://localhost:3000","http://localhost:5173"]` | Allowed frontend origins |
| `GROQ_API_KEY` | unset | Enables CrewAI agents; fallback mode without it |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq LLM |
| `CHROMA_PERSIST_DIR` | `./chroma_db` | ChromaDB vector store location |

## Auth

- Users register/login via `/api/auth/register`, `/api/auth/login` (bcrypt-hashed passwords, JWT bearer tokens).
- Seeded admin on first boot: `admin@smartecommerce.com` / `admin` — change immediately in production.
- Admin-only routes require a token from `/api/auth/admin-login`.

## Architecture

```
app/
  api/        # routers (auth, categories, products, cart, wishlist, orders, reviews,
              #          admin, search, discovery)
  core/       # config + security (JWT, hashing)
  db/         # SQLAlchemy engine/session/base + init/seed
  models/     # ORM models (mirror legacy EazyDeals schema + review)
  schemas/    # Pydantic v2 API contract
  services/   # business logic (retrieval service)
ai/           # ISOLATED AI layer — no imports from app/ CRUD internals
  rag.py      # ChromaDB vector retrieval
  indexer.py  # keeps the vector index in sync with product CRUD
  llm.py      # Groq Llama 3.3 via CrewAI LLM
  agents.py   # CrewAI: Coordinator + Search/Recommendation/Pricing/Coupon/Review agents
  discovery.py# conversational discovery orchestration (graceful fallback)
```

## AI / RAG

- Products are auto-indexed into ChromaDB on create/update/delete; `POST /api/admin/rag/resync` rebuilds the index.
- `GET /api/search?q=...` — semantic retrieval with SQL LIKE fallback.
- `POST /api/discovery/chat` — conversational product discovery. Without `GROQ_API_KEY` it returns a deterministic fallback answer; with it, a CrewAI crew runs (Coordinator manages the workflow, specialists handle search/recs/pricing/coupons/reviews).

## Tests

```bash
uv run pytest
```

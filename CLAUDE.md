# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog with Neobrutalism comic-book aesthetics. Monorepo: React frontend + Express backend + SQLite.

## Commands

```bash
# Install all dependencies
npm run install:all

# Run both servers
npm run dev

# Run individually
npm run dev:frontend    # Vite on :3000, proxies /api → :3001
npm run dev:backend     # Express on :3001

# Frontend only
cd frontend && npm run build    # production build
cd frontend && npm run lint     # tsc --noEmit type check
```

## Architecture

### Frontend (`frontend/`)

React 19 SPA with React Router v7. Pages:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Hero` | Landing page |
| `/about` | `About` | Personal profile |
| `/toolbox` | `Toolbox` | Tool showcase |
| `/articles` | `ArticlesView` | Public article list with category tabs (全部/资讯/政策) and search. Opens detail modal on click. |
| `/garden` | `DigitalGarden` | Public garden notes, click to open detail modal |
| `/admin` | `Login` | Admin login. Auto-creates first admin on failed login. |
| `/admin/dashboard` | `Dashboard` | Protected. Two tabs: articles CRUD + garden notes CRUD. Rich text via ReactQuill, JSON import, file uploads. |

Key patterns:
- `NavbarContext` from `App.tsx` — article/garden detail modals hide the navbar via `setNavbarHidden(true)`
- CSS utilities defined in `index.css`: `comic-panel`, `comic-button`, `sketched-border`, `halftone-bg`, `onomatopoeia`, `charm-tag`
- Custom colors via Tailwind v4 `@theme`: `comic-red` (#FF2E00), `comic-yellow` (#FFE500), `comic-blue` (#00D1FF), `zaun-green` (#39FF14), `zaun-purple` (#BF00FF)
- Custom fonts: SmileySans (comic), Permanent Marker (marker), Space Grotesk (body)
- Vite resolves `@/` to `frontend/`
- API calls use relative paths (`/api/...`), proxied to backend in dev

### Backend (`backend/`)

Express 5, Sequelize ORM, SQLite (`backend/database/database.sqlite`).

**Models:** `Article` (title, summary, content HTML, aiAnalysis HTML, category, sourceUrl, attachmentUrl, isHidden), `GardenNote` (title, content HTML, tags as comma-separated string, isHidden), `Admin` (username, password bcrypt)

**Routes:**
- `POST /api/auth/login` — returns JWT token
- `POST /api/auth/setup` — create first admin (only if none exist)
- `GET /api/articles?admin=true&search=&category=` — public gets visible only; admin gets all
- `POST/PUT/DELETE /api/articles/:id` — protected CRUD
- `PATCH /api/articles/:id/toggle-visibility` — toggle isHidden
- `GET /api/garden?admin=true` — same visibility pattern
- `POST/PUT/DELETE /api/garden/:id` — protected CRUD
- `POST /api/upload?folder=` — protected file upload (multer), organized by article folder
- `DELETE /api/upload?url=` — protected file deletion

**Auth:** JWT middleware in `middlewares/auth.ts`. Token sent as `Authorization: Bearer <token>`.

### Data Flow

- Category filtering on frontend uses `.includes('资讯')` / `.includes('政策')` for partial matching
- Article content and aiAnalysis are HTML strings edited via ReactQuill, rendered with `dangerouslySetInnerHTML`
- Upload files stored in `backend/database/uploads/` organized by `article_<id>` or `draft_<ts>` folders, served at `/uploads/`
- JSON import maps fields loosely (supports multiple key name variants) for batch content migration

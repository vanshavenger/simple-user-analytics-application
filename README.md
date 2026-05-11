# User Analytics Application

A full-stack user analytics app that tracks page views and clicks, stores them in MongoDB, and displays insights on a React dashboard with session tracking and click heatmaps.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Bun |
| **Language** | TypeScript (end to end) |
| **Backend** | Express.js 5, Mongoose 9 |
| **Frontend** | React 19 + Vite |
| **Styling** | Tailwind CSS v4 + shadcn/ui components |
| **Charts** | Recharts (PieChart, BarChart, ScatterChart) |
| **Database** | MongoDB |
| **Tracking** | Vanilla JS script (compiled from TS with Bun) |
| **Real-time** | Server-Sent Events (SSE) for live event streaming |

## Features

- **Event Tracking** — Lightweight JS script tracks `page_view` and `click` events with session IDs, timestamps, click coordinates, and rich metadata (browser user agent, viewport size, referrer, clicked element tag & text)
- **Sessions View** — Lists all sessions with event counts; click a session to see the full user journey (timeline, event breakdown charts, device info)
- **Heatmap View** — Select a page URL from a dropdown; displays click positions as a scatter chart with X/Y axes
- **Live Event Feed** — Real-time stream of incoming events via Server-Sent Events (SSE); shows event type, page, coordinates, element info, and session ID as they arrive
- **CSV Export** — Download all events or a single session's events as a CSV file with all 12 fields
- **Dark Mode** — Light/dark theme toggle, persisted in localStorage
- **Skeleton Loading** — Pulsing placeholder UIs while data loads (no layout shift)
- **Global Refresh** — One-click cache invalidation to re-fetch all data without page reload
- **React 19 Suspense** — Data fetching with `use()` + `<Suspense>` boundaries instead of `useEffect`

## Project Structure

```
├── backend/              # Express API server
│   ├── .env              # Environment variables
│   └── src/
│       ├── models/Event.ts
│       ├── routes/events.ts
│       └── server.ts
├── frontend/             # React dashboard
│   └── src/
│       ├── components/
│       │   ├── ui/           # shadcn/ui components (Button, Card, Badge, etc.)
│       │   ├── SessionsView.tsx
│       │   ├── SessionDetail.tsx
│       │   ├── HeatmapView.tsx
│       │   ├── LiveFeed.tsx
│       │   ├── ThemeToggle.tsx
│       │   └── Skeletons.tsx
│       ├── fetchData.ts      # Promise cache for React 19 use()
│       ├── types.ts
│       └── App.tsx
├── tracker/              # Client-side tracking script
│   ├── tracker.ts
│   ├── dist/tracker.js   # Compiled output
│   └── demo.html
└── README.md
```

## Setup Steps

### Prerequisites
- [Bun](https://bun.sh) (v1.0+)
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Configure Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/user_analytics
```

### 2. Install & Run Backend

```bash
cd backend
bun install
bun run dev
```

Backend runs on `http://localhost:5000`.

### 3. Install & Run Frontend Dashboard

```bash
cd frontend
bun install
bun run dev
```

Dashboard runs on `http://localhost:3000`.

### 4. Build & Test Tracker

```bash
bun build tracker/tracker.ts --outdir tracker/dist
```

Open `tracker/demo.html` in a browser. Click around to generate events, then check the dashboard.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/track` | Receive and store an event |
| GET | `/api/events/sessions` | List all sessions with event counts |
| GET | `/api/events/sessions/:sessionId/events` | All events for a session (ordered by time) |
| GET | `/api/events/heatmap?page_url=...` | Click coordinates for a page (heatmap) |
| GET | `/api/events/pages` | Distinct tracked page URLs |
| GET | `/api/events/stream` | SSE endpoint — real-time event stream |
| GET | `/api/events/export/sessions` | Download all events as CSV |
| GET | `/api/events/export/sessions/:sessionId` | Download a single session's events as CSV |

### Event Payload Fields

Every event sent by the tracker includes:

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Unique session ID stored in localStorage |
| `event_type` | string | `page_view` or `click` |
| `page_url` | string | Current page URL (without query/hash) |
| `timestamp` | string | ISO 8601 timestamp |
| `user_agent` | string | Browser user agent string |
| `screen_width` | number | Browser viewport width in pixels |
| `screen_height` | number | Browser viewport height in pixels |
| `referrer` | string/null | URL the user came from (null if direct visit) |
| `click_x` | number/null | Click X coordinate (click events only) |
| `click_y` | number/null | Click Y coordinate (click events only) |
| `element_tag` | string/null | HTML tag of clicked element, e.g. `button` (click events only) |
| `element_text` | string/null | Visible text of clicked element, max 100 chars (click events only) |

### How Live Feed (SSE) Works

1. The frontend opens a persistent HTTP connection to `GET /api/events/stream`
2. The server sets `Content-Type: text/event-stream` and keeps the connection open
3. Every time a new event is tracked via `POST /track`, the server broadcasts it to all connected clients
4. The frontend's `EventSource` API receives each event and adds it to the live feed UI
5. When the browser tab closes, the server cleans up the connection automatically

## Assumptions & Trade-offs

- **Session management** — Uses `localStorage` for session IDs (as required). Sessions persist until localStorage is cleared.
- **Heatmap** — Displays click coordinates as scatter dots on a recharts ScatterChart with X/Y axes.
- **No authentication** — Dashboard and API are open. Add auth middleware for production use.
- **CORS open** — All origins allowed for development; restrict in production.
- **React 19 `use()`** — Used instead of `useEffect` for data fetching. Requires a custom promise cache (`fetchData.ts`) to prevent infinite suspend loops.
- **Tailwind CSS v4** — Uses `@theme` CSS variables for theming; dark mode swaps variables via `.dark` class.

## Future Improvements

- **TanStack Query** — Replace the custom `fetchData` promise cache with [TanStack Query](https://tanstack.com/query) for automatic caching, background refetching, stale-while-revalidate, retry logic, and devtools.
- **Density heatmap** — Add a canvas-based density heatmap (e.g. `simpleheat` or `h337`) to visualize click hotspots with color gradients instead of dots.
- **Real session duration** — Track `beforeunload` / `visibilitychange` events in the tracker to capture actual time spent on page.
- **Pagination** — Add server-side pagination for sessions and events when data grows large.
- **Authentication** — Protect the dashboard and API with JWT or session-based auth.
- **Rate limiting** — Add rate limiting on the `/track` endpoint to prevent abuse.
- **Event batching** — Buffer events in the tracker and send them in batches to reduce network requests.
- **Filtering & date range** — Filter sessions/heatmap by date range, event type, or page URL.

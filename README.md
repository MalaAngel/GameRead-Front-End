# GameRead frontend

UI-only React prototype for GameRead (child reading client + parent dashboard). No backend yet:
all data goes through a swappable service layer so Supabase can be attached later.

## Run
```bash
npm install
npm run dev        # http://localhost:5173  (HashRouter, so refresh works anywhere)
npm run build      # type-check + production build
npm run lint
npm test           # reward formula tests
```
Open `/#/dev/components` for the living component gallery.

## Stack
Vite · React 18 · TypeScript (strict) · Tailwind (tokens in `tailwind.config.js`) · React Router (HashRouter, one flat table in `src/routes.tsx`) · TanStack Query · Recharts · react-hook-form + zod.

## Route map
| Route | Screen | Status |
|---|---|---|
| `/` | Sign up / Log in (+ role) | Phase 5 |
| `/parent` | Dashboard | Phase 4 |
| `/parent/family` | My Family (+ session control drawer) | Phase 4 |
| `/parent/tasks` | Assigned Tasks | Phase 4 |
| `/parent/rules` | Rules (tabs: Apps / Schedules / Rewards) | Phase 4 |
| `/parent/playtime` | Playtime and History (tabs: Playtime / History / Alerts) | Phase 4 |
| `/parent/settings` | Settings | Phase 4 |
| `/child` | Home | Done |
| `/child/read/:bookId` | Reader | Done |
| `/child/tasks` | Assigned Tasks | Done |
| `/child/history` | History and Play Time wallet (`?tab=wallet`) | Done |
| `/child/settings` | Settings | Done |
| `/dev/components` | Component gallery | Done |

Session dialogs, the lockdown notice, add-reading, add-child and rule editors are modals/drawers/tabs, not routes.

## Folder layout
```
src/
  components/ui/   shared design system (Card, Pill, Button, BookCover, ProgressBar, Sidebar, WindowFrame, Modal, Tabs, Toast, Fields, DataState…)
  layouts/         ChildLayout (pink 1000x700 window) · ParentLayout (cream web + blue sidebar)
  features/        screens, grouped by role (auth, child, parent, dev)
  hooks/           queries.ts (reads) · mutations.ts (writes) · useActiveChild · useCrossTabSync
  services/        api.ts (interface) · mockApi.ts · seed.ts · index.ts (the swap point)
  lib/             reward.ts (formula, tested) · format.ts
  types/db.ts      types mirroring the planned Supabase tables
design/            reference slides from the proposal
```

## Rules for screens
1. Never import `services/*` or seed data in a component. Use the hooks in `src/hooks`.
2. Every list/form needs loading, empty and error states (`<DataState>`).
3. Use the tokens (pink / blue / cream / navy / accent) and shared components, no ad-hoc colours.
4. Reward maths lives only in `src/lib/reward.ts`: `min(floor(verifiedMinutes * ratio), dailyCapRemaining)`.

## Connecting Supabase later
1. Create tables matching `src/types/db.ts` (snake_case). Add Row Level Security so a parent only sees their own children.
2. `npm i @supabase/supabase-js`, create `src/services/supabaseApi.ts` implementing `GameReadApi`:
   `auth.*` -> Supabase Auth (+ Google/Apple OAuth), `*.list/get/add` -> PostgREST,
   `sessions.getLiveState` / `subscribe` -> Realtime channels, `sessions.end` and `playtime.wallet` -> Postgres functions
   (so the reward is validated server-side, NFR-05), `stats.get` -> a SQL view.
3. In `src/services/index.ts` change `export const api = mockApi` to `supabaseApi`. No screen changes needed.
4. `npx supabase gen types typescript` and align `types/db.ts`.

## Simulated parts (until the device agent exists)
Process scanning, blocking and tamper detection (F-01 to F-05) are represented by `sessions.simulateBlockedApp`,
`alerts.fire` and `sessions.parentOverride`, driven from the floating **Demo tools** panel (bottom-right): simulate a blocked app, task switching, parent override, tamper alert, switch role, change the reading-clock speed (60x makes one second count as one reading minute) and reset data.

## Demo data
Seed data matches the design slides (10 h 43 min read -> 3 h 15 min unlocked). Demo parent login:
`demo.parent@gameread.app` / `demo1234`, or any 6-digit family code for the child. State lives in `localStorage`
(`gameread.db.v1`); clear it or use "Reset demo data" to reseed. Parent and child can run in two tabs and stay in sync.

## Child client notes
- The reader's timer only counts *verified* reading: it stops when paused, idle for 60 s ("Still reading?" prompt), locked down or ended.
- Progress is saved to the service layer every 2 s (`sessions.recordProgress`); ending a session computes the bonus with `src/lib/reward.ts`.
- All books use the same public-domain sample text (Alice's Adventures in Wonderland), paginated by `src/lib/paginate.ts`.
- The lockdown notice (`features/child/LockdownOverlay.tsx`) renders inside the child window whenever the live state reports lockdown.

# TASK: Build the parent dashboard and auth screens in the existing GameRead repo

This repo already contains a working React + Vite + TypeScript + Tailwind frontend. The **child client is finished**; the shared design system, mock backend and hooks all exist. Your job is to replace the remaining `<Placeholder>` routes in `src/routes.tsx` with real screens for the **parent web dashboard and the sign-up/log-in page**, matching `/design/02-parent-signup.png` and `/design/03-parent-dashboard.png`.

Read `README.md` first. Do not ask questions; make the simplest reasonable choice and note it in the PR description.

## Hard rules (the architecture depends on these)
1. **Never import from `src/services/*` or seed data inside a component.** Use the hooks in `src/hooks/queries.ts` and `src/hooks/mutations.ts`. If you need data the hooks do not provide, add a method to the `GameReadApi` interface (`src/services/api.ts`), implement it in `mockApi.ts`, and add a hook; do not bypass the layer.
2. **Reuse `src/components/ui`** (Card, Pill, Button, BookCover, ProgressBar, Meter, Sidebar, Modal, ConfirmDialog, Tabs/TabPanel, Toast, Input/Select/Toggle, DataState, StatusChip, Avatar, StatTile/Duration). Study `src/features/child/*` and `src/features/dev/Showcase.tsx` for the exact patterns and styling. Extend a shared component only when necessary, keeping it backwards compatible.
3. **Use design tokens only** (pink / blue / cream / navy / accent in `tailwind.config.js`). No hard-coded colours except inside charts, where navy `#0B4470` is used.
4. **Every list, table and form has loading, empty and error states** (`<DataState>`), validation messages (react-hook-form + zod) and accessible labels, focus states and dialog semantics.
5. Reward maths lives only in `src/lib/reward.ts`; reuse `bonusMinutes` for previews.
6. No new dependencies. Keep files under ~250 lines; split into `src/features/parent/*` and `src/features/auth/*`.
7. Do not modify the child screens except to fix a bug you find (mention it in the PR).

## Screens to build

### Auth, route `/` (`src/features/auth/AuthPage.tsx`) per slide 02
- Left: logo with "PARENT" subtitle and the headline "Develop your child's literacy skills - join GameRead today!". Right: cream form card.
- Toggle **Sign up / Log in**. Sign up: username, email, password (strength hint), consent checkbox ("I'm the parent or guardian"), Create Account. Log in: username-or-email + password.
- "Continue with" Google / Apple / Other buttons (`auth.signInWithProvider`).
- Role tabs **Parent | Child**. Child shows a 6-digit family-code input (`auth.joinWithFamilyCode`, any 6 digits work in the mock) and routes to `/child`. Parent routes to `/parent`.
- Add a visible "Try the demo" link that calls `auth.signInAsDemo`.
- Zod validation with inline errors; show API errors (e.g. wrong password, taken username) via toast or inline.
- Add `RequireRole` route guards: `/parent/*` requires a parent user, `/child/*` a child user; otherwise redirect to `/`. (The Demo tools "View as parent/child" buttons sign in as the demo user so they keep working.) Add a sign-out button to the parent sidebar footer.

### Parent Dashboard, `/parent` per slide 03 (`DashboardPage.tsx`)
- Child profile widget (initials Avatar, name, age band, reading level) with a **child switcher** when the parent has more than one child (uses `useActiveChild().setChildId`).
- **Pages Read** horizontal bar chart (Recharts) from `useStats().monthly_pages` (June 23, July 30, August 19) with value labels.
- **Weekly hours read** tile (clock icon + `Duration`) from `stats.weekly_minutes`.
- **Daily / Weekly toggle** (Tabs): Weekly shows the monthly pages chart; Daily shows `stats.daily_minutes` as a bar chart of minutes per day.
- Live **status chip** (`useLiveState` -> `StatusChip`) that updates when the child's state changes (cross-tab sync already works) and an **alert badge** linking to `/parent/playtime?tab=alerts` showing unacknowledged alerts.
- **Assigned Readings** shelf with BookCovers and a "+ Add" button opening an **Add Reading modal** (book picker with search, due date, target minutes, child) -> `useCreateAssignment`, toast on success.

### My Family, `/parent/family` (`FamilyPage.tsx`)
- Card per child: avatar, status chip, device name, last active, today's read and play minutes (`useWallet`, `useSessions`).
- **Add child** modal (name, age band, reading level) -> `useAddChild`; on success show the generated 6-digit pairing code with a copy button and instructions.
- **Session control drawer** (slide-in panel) per child: current session info (book, verified minutes), **Pause/Resume** (`usePauseSession`/`useResumeSession`) and **End lockdown now** -> `ConfirmDialog` -> `useParentOverride`. Disabled with an explanation when no session is active.
- Remove child (ConfirmDialog, `useRemoveChild`).

### Assigned Tasks, `/parent/tasks` (`TasksPage.tsx`)
- Table: book (cover + title), child, due date, progress bar (navy fill, use `fill="navy"`), status pill. Filters by child and status. Add (reuse the Add Reading modal), edit due date/target (`useUpdateAssignment`), remove with confirm.

### Rules, `/parent/rules` (`RulesPage.tsx`) with Tabs **Apps | Schedules | Rewards**
- **Apps:** two lists, Allowed (whitelist) and Blocked (blacklist), from `useRules`. Add an app by executable name and optional path (validate non-empty, `.exe` hint), toggle allow/block, delete. Preset chips (Games: Roblox, Minecraft, Fortnite; Browsers: chrome.exe, msedge.exe; Social: Discord.exe). Note: "Rules sync to the child's device when the backend is connected."
- **Schedules:** weekly grid (7 days x hours 06:00-22:00). Click a cell to cycle none -> Reading -> Lockdown; Shift-click-drag or a "paint" mode is a bonus. Legend, "Clear all", dirty state, **Save** (`useSaveSchedule`) with toast.
- **Rewards:** ratio slider (0.10-1.00 play minutes per reading minute), daily-cap input (0-480 min), a **live preview** ("30 min of reading -> X min of play, cap Y") using `bonusMinutes`, Save (`useSaveRewards`) with toast, and unsaved-changes indicator.

### Playtime and History, `/parent/playtime` with Tabs **Playtime | History | Alerts** (`?tab=` in the URL)
- **Playtime:** wallet summary tiles (earned, spent, balance), today's cap `Meter`, a trend chart of minutes earned per day (Recharts, derive from `useLedger`), and the ledger table (date, note, earned/spent minutes). Show a "Verified by server" badge.
- **History:** Daily / Weekly report toggle, date-range filter, sessions table (date, book, duration, pages, bonus), totals row, and a **Print / Export** button (`window.print()` with a print stylesheet that hides the sidebar).
- **Alerts:** tamper/blocked-attempt feed from `useAlerts` with severity badge (Pill tones), type icon, timestamp, **Acknowledge** (`useAcknowledgeAlert`), filter All / Unacknowledged. Label the section "Simulated data (device agent not yet connected)". The floating Demo tools "Fire tamper alert" button should make a new alert appear live.

### Settings, `/parent/settings` (`SettingsPage.tsx`)
- Account details (read-only email/username), notification Toggles and report-frequency Select bound to `usePreferences` / `useSavePreferences`, a child data and privacy section with a **Delete child data** button (ConfirmDialog; may call `useRemoveChild`), and sign out.

## Layout notes
- `ParentLayout` already provides the blue rounded sidebar on a cream background (min width 1024px; no mobile layout required). Page titles are `text-3xl font-semibold`; cards use `Card`; spacing `gap-6`.
- Keep screens scannable: one primary action per card, big numbers via `Duration`/`StatTile`.
- Parent action efficiency (NFR-06): any common action (assign a book, block an app, end lockdown) must be reachable in 3 clicks or fewer.

## Verify before opening the PR
1. `npm run lint`, `npm run build` and `npm test` all pass.
2. Manually click through every `/parent/*` route and `/`, in this scenario: sign up (or Try the demo) -> add a reading assignment -> block an app in Rules -> open `/#/child` in a second tab, start a reading session, use Demo tools -> "Simulate blocked app launch": the blocked app named in the notice must come from the parent's blacklist, the parent dashboard status chip must change to Locked, and the Alerts tab must show the new event. Then end lockdown from My Family and confirm the child sees the "parent ended lockdown" notice.
3. List any assumptions in the PR description and update the route table in `README.md`.

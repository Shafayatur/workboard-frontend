# Workboard — Frontend

Next.js + TypeScript frontend for **Workboard**: a Kanban task manager with
AI-powered quick-add, and an image annotation tool with AI-suggested shape
labels.

- **Live app:** https://workboard-frontend-live.vercel.app
- **Backend repo:** https://github.com/Shafayatur/workboard-backend
- **Live API:** https://workboard-backend-h6em.onrender.com
- **Demo login:** `demo@workboard.app` / `DemoPass123!`

---

## Stack

- Next.js 15 (App Router) + TypeScript (strict)
- Tailwind CSS v4 — custom design system (see "Design direction" below)
- Zustand for state (auth, date selection, tasks, annotations)
- dnd-kit for the Kanban drag-and-drop
- react-konva for the polygon annotation canvas
- Deployed on Vercel

## Requirements

- **Node.js 18.18+** (20+ recommended)
- npm

## Setup

```bash
git clone https://github.com/Shafayatur/workboard-frontend.git
cd workboard-frontend

npm install

echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api" > .env.local

npm run dev
```

App will be live at `http://localhost:3000`. It expects the backend
(`workboard-backend`) running locally at `http://127.0.0.1:8000` — see that
repo's README to get it running, including the demo login.

## Design direction

The visual identity is deliberately not a generic AI-default look: white
paper background, near-black ink, a single marker-red used the way a reviewer
marks up a document — hand-drawn circles and checkmarks as the one
intentional imperfection against an otherwise precise black grid, which
mirrors what the annotate feature actually does (marking things up by hand).

---

## Villains faced (and how they were beaten)

**Turbopack crashed on startup with a filesystem permission error.** It had
auto-detected the "workspace root" as the home directory (because of a stray
`package-lock.json` sitting there from an unrelated `npm install`), then tried
to scan `~/Downloads` and hit a macOS permissions wall. Fixed by explicitly
pinning `turbopack.root` in `next.config.ts` instead of letting it guess.

**A hydration mismatch on every protected page,** traced to `ProtectedRoute`
checking `localStorage` synchronously during render to decide what to show.
`localStorage` doesn't exist during server rendering, so the server and the
client's first render produced different output — React caught the mismatch
and silently re-rendered client-side, which "worked" but logged an error on
every load. Fixed by having both server and the client's first paint render
an identical neutral `'checking'` state, and only performing the real
`localStorage` check inside a `useEffect` (which only ever runs client-side,
after hydration is already complete).

**A second, unrelated hydration error** turned out to be a nested `<form>`:
the tag-creation control inside `TagPicker` rendered its own `<form>`, nested
inside `TaskModal`'s form — invalid HTML that React can't reconcile between
server and client. Fixed by converting the inner control to a plain `<div>`
with an Enter-key handler instead of relying on native form submission.

**The date-picker's prev/next arrows behaved inconsistently** — pressing
"next" sometimes appeared to do nothing, or "previous" would jump by more
than a day. Root-caused not by guessing but by writing out the exact date
arithmetic and running it directly in Node for several click sequences,
which showed the bug precisely: the window's recentering math implicitly
assumed the selected day was always sitting at the strip's edge, which was
only true after the *second* press onward, not the first. Fixed by having
the window and the selection always shift by the exact same delta, which is
correct regardless of where the current selection sits.

**A task created for a future date would still show up on today's board.**
The store was appending every newly-created task straight into the visible
list without checking whether its due date actually matched the day being
viewed. Fixed by filtering on `due_date` before adding a task to local state
— and the same fix made editing a task's due date correctly remove it from
the board you're currently looking at, if it no longer belongs there.

**The quick-add bar and the whole board would flash and disappear** every
time a different date was selected, not just on first load — because both
were nested inside a loading-state conditional that re-triggered on every
`fetchTasksForDate` call. Fixed by only showing the full loading state before
anything has ever loaded, and letting subsequent date switches update the
board in place without unmounting it.

**AI shape auto-labeling silently failed in some cases** because cropping a
drawn region out of the source image for the Gemini vision call requires
reading pixel data via `canvas.toDataURL()` — which throws a "tainted canvas"
security error unless the image was loaded with `crossOrigin="anonymous"`.
Easy to miss because it only manifests depending on how the image server's
CORS headers are configured, not something that shows up as an obvious bug
in isolation.
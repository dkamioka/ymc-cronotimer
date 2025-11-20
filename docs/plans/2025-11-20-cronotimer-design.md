# YMC Cronotimer - Design Document

**Date:** 2025-11-20
**Status:** Approved
**Timeline:** 9 weeks to beta launch

## Executive Summary

YMC Cronotimer is a multi-tenant web application for CrossFit boxes to create, manage, and execute workout timers. The primary use case is displaying a highly visible timer on a 50" TV (3-15m viewing distance) with remote control capabilities via mobile device.

**Key Differentiators vs. intervaltimer.com:**
- Real-time sync between web/mobile
- Complex workout hierarchy (Workout → Section → Exercise → Round)
- Accurate time tracking for countdown modes
- Offline-first PWA
- Multi-tenant architecture (multiple boxes on same instance)

## Problem Statement

Yellow Monkey CrossFit currently uses intervaltimer.com, which has critical limitations:
- No sync between web and mobile apps
- Broken timeline (warmup sections don't display correctly)
- Copy/paste only available on mobile app
- Countdown mode doesn't register actual time executed
- TV access via browser is limited

## Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS for responsive UI
- Zustand for state management
- React Router for navigation
- PWA with Service Worker + Workbox
- Dexie.js for IndexedDB

**Backend:**
- Supabase (Postgres + Realtime + Auth + Edge Functions)
- Row Level Security (RLS) for multi-tenant isolation
- PostgREST automatic API

**Infrastructure:**
- Frontend: Vercel (CDN, auto-deploy, preview URLs)
- Backend: Supabase Cloud (managed, auto-scaling)
- Real-time: Supabase Realtime (WebSocket)

**Rationale:**
- Eliminates operational complexity (no backend to manage)
- Accelerates development (auth + real-time solved)
- End-to-end TypeScript
- Native offline support
- 9-week timeline is achievable

### System Components

```
┌─────────────────────────────────────────────────────┐
│                   PWA Frontend                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │  Editor  │  │   TV     │  │ Remote Control  │  │
│  │  Module  │  │  Module  │  │     Module      │  │
│  └──────────┘  └──────────┘  └─────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │         Sync Layer (Dexie + Queue)           │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↕
              Supabase Realtime (WebSocket)
                        ↕
┌─────────────────────────────────────────────────────┐
│                  Supabase Backend                   │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │ Postgres │  │   Auth   │  │  Edge Functions │  │
│  │   +RLS   │  │   (JWT)  │  │   (optional)    │  │
│  └──────────┘  └──────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Data Model

### Multi-Tenant Schema

```sql
-- Multi-tenancy base
CREATE TABLE boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  box_id UUID NOT NULL REFERENCES boxes(id),
  role TEXT NOT NULL CHECK (role IN ('owner', 'coach', 'athlete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core workout data
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_id UUID NOT NULL REFERENCES boxes(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  slug TEXT NOT NULL, -- "macaco-dumbell-1" or custom
  name TEXT NOT NULL,
  date DATE NOT NULL,
  tags TEXT[],
  is_template BOOLEAN DEFAULT FALSE,
  total_duration INTERVAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(box_id, slug)
);

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  color TEXT,
  repeat_count INTEGER DEFAULT 1,
  exclude_from_total BOOLEAN DEFAULT FALSE
);

CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  "order" INTEGER NOT NULL
);

CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  duration INTERVAL NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('countup', 'countdown')),
  color TEXT,
  exclude_from_total BOOLEAN DEFAULT FALSE,
  "order" INTEGER NOT NULL
);

CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id),
  round_id UUID NOT NULL REFERENCES rounds(id),
  planned_duration INTERVAL NOT NULL,
  actual_duration INTERVAL NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL
);
```

### Row Level Security (RLS)

**Critical for multi-tenant isolation:**

```sql
-- Users can only see workouts from their box
CREATE POLICY "workouts_select" ON workouts
  FOR SELECT USING (
    box_id IN (SELECT box_id FROM users WHERE id = auth.uid())
  );

-- Only coaches and owners can create workouts
CREATE POLICY "workouts_insert" ON workouts
  FOR INSERT WITH CHECK (
    box_id IN (
      SELECT box_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Similar policies for UPDATE, DELETE
-- All related tables (sections, exercises, rounds) inherit isolation via foreign keys
```

### URL Structure

```
app.cronotimer.com/yellow-monkey/dashboard
app.cronotimer.com/yellow-monkey/editor/novo
app.cronotimer.com/yellow-monkey/editor/macaco-dumbell-1
app.cronotimer.com/yellow-monkey/tv/macaco-dumbell-1
app.cronotimer.com/yellow-monkey/remote/ABCD12
```

**Slug Generation:**
- Auto-generate: 3 random words from CrossFit-themed dictionary + incremental number
  - Examples: "macaco-dumbell-1", "burpee-kettlebell-7", "squat-box-23"
- User-defined: validates uniqueness within box, allows override

## Feature Specifications

### 1. Editor Module

**Layout (Desktop - 3 columns):**

```
┌─────────────┬──────────────────────┬─────────────┐
│  BIBLIOTECA │    CANVAS/TIMELINE   │ PROPRIEDADES│
│             │                      │             │
│ [+ Novo]    │ ┌──────────────────┐ │ Nome:       │
│             │ │ AQUECIMENTO 10'  │ │ [________]  │
│ Hoje        │ │ ├─ Mobilidade    │ │             │
│ › Metcon    │ │ └─ 3 rounds      │ │ Duração:    │
│   (ativo)   │ │                  │ │ [10]:[00]   │
│             │ │ TÉCNICA 15'      │ │             │
│ Ontem       │ │ ├─ Back Squat    │ │ Cor:        │
│ › WOD       │ │ └─ 5x5 @ 3:00ea  │ │ [🎨]        │
│             │ │                  │ │             │
│ Templates   │ │ CIRCUITO x3      │ │ Modo:       │
│ › Warmup    │ │ ├─ AMRAP 12'     │ │ ◉ Count-up  │
│ › EMOM      │ │ └─ Rest 2'       │ │ ○ Countdown │
│             │ └──────────────────┘ │             │
│             │ TOTAL: 47:00         │ □ Excluir   │
│             │                      │   do total  │
└─────────────┴──────────────────────┴─────────────┘
```

**Hierarchy:**
```
Workout
├─ Section (Aquecimento, Técnica, WOD, etc.)
│  ├─ Exercise (Back Squat, AMRAP, etc.)
│  │  └─ Round (duration, mode, color)
```

**Operations:**

1. **Create Section:**
   - Click "+ Nova Seção"
   - Presets: Aquecimento, Técnica, WOD, AMRAP, EMOM, TABATA, Rest, Custom
   - Auto-populates defaults based on preset

2. **Add Exercises/Rounds:**
   - Drag & drop from exercise library
   - Quick add parser: "Back Squat 5x3:00" → creates 5 rounds of 3min
   - Inline editing: double-click to edit name, duration, color

3. **Copy/Paste:**
   - Ctrl/Cmd+C on section → copies entire section
   - Ctrl/Cmd+V → pastes below
   - Right-click → "Duplicate section"
   - Drag to reorder

4. **Repeat Sequence (x3):**
   ```
   Section: Circuito
   ├─ Repeat: [3x] ← dropdown
   ├─ AMRAP 12'
   └─ Rest 2'

   Timeline result:
   ├─ AMRAP 12' (Round 1/3)
   ├─ Rest 2'
   ├─ AMRAP 12' (Round 2/3)
   ├─ Rest 2'
   ├─ AMRAP 12' (Round 3/3)
   └─ Rest 2'
   ```

5. **Count-up vs Countdown:**
   - Radio buttons in Properties panel
   - Visual indicator in timeline: ↑ (count-up), ↓ (countdown)
   - Quick toggle: right-click → "Switch to count-up/countdown" or hotkey "T"
   - Smart defaults:
     - **Countdown**: AMRAP, EMOM, Rest (fixed duration)
     - **Count-up**: For Time, Mobilidade, Técnica (open duration)

6. **Timeline Totalizer:**
   - Horizontal bar shows proportional duration
   - Excluded blocks: opacity 0.5 + icon ⊗
   - Footer total: `47:00 (51:00 with exclusions)`

**Mobile (PWA) Adaptations:**
- Single column layout (no sidebar)
- Bottom sheet for properties
- Long-press to copy/edit
- Swipe to delete
- FAB (Floating Action Button) for adding sections

**Templates:**
- Save current workout as template: ✓ "Save as template"
- Templates have no specific date
- Using template creates copy with today's date

### 2. Execution Module (TV Display)

**Critical Requirement:** Visible from 3-15 meters on 50" TV. Priority = contrast, size, simplicity.

**Layout:**

```
┌────────────────────────────────────────────────┐
│ [QR Code]        YELLOW MONKEY           [●●●]│ ← 5% header
├────────────────────────────────────────────────┤
│                                                │
│              AQUECIMENTO                       │ ← 10% section name
│                                                │
│                                                │
│                 08:47                          │ ← 50% timer
│                                                │
│                                                │
├────────────────────────────────────────────────┤
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← 10% progress
├────────────────────────────────────────────────┤
│  PRÓXIMO: Técnica - Back Squat 5x5 (12:00)    │ ← 10% preview
├────────────────────────────────────────────────┤
│    [⏮ VOLTAR]  [⏸ PAUSAR]  [⏭ PULAR]        │ ← 15% controls
└────────────────────────────────────────────────┘
```

**Typography (Visibility Maximized):**

- **Timer:**
  - `font-size: 30vh` (30% of viewport height)
  - `font-family: 'Inter', 'SF Mono', monospace`
  - `font-weight: 700`
  - `color: #FFFFFF`
  - `text-shadow: 0 4px 20px rgba(0,0,0,0.5)`

- **Section name:**
  - `font-size: 8vh`
  - `font-weight: 600`
  - `text-transform: uppercase`
  - `letter-spacing: 0.1em`

- **Next block:**
  - `font-size: 4vh`
  - `opacity: 0.9`

**Color Schemes (per section/round):**

```typescript
const colorSchemes = {
  warmup:    { bg: '#FF6B35', text: '#FFFFFF' }, // Orange
  technique: { bg: '#004E89', text: '#FFFFFF' }, // Blue
  wod:       { bg: '#C1121F', text: '#FFFFFF' }, // Red
  cooldown:  { bg: '#2A9D8F', text: '#FFFFFF' }, // Teal
  rest:      { bg: '#212529', text: '#FFFFFF' }, // Dark gray
  custom:    { bg: workout.color, text: autoContrast(workout.color) }
};
```

**Progress Bar:**
- Height: `8vh`
- Gradient fill based on block color
- Smooth animation (300ms transition)
- Shows: `Round 3/5`

**Alerts (End of Block):**

```typescript
// 10 seconds before end
if (timeRemaining <= 10) {
  element.style.animation = 'pulse 1s infinite'; // Red border flash
}

// On complete
function onBlockComplete() {
  playBeep();      // AudioContext - 3 short beeps
  flashScreen();   // Full white flash 200ms
  showNextBlock(); // Smooth transition
}
```

**Controls (Smart TV Optimized):**

- Always visible (no auto-hide - Smart TV has no mouse)
- Large buttons: `height: 12vh`, `width: 20vw`
- Icon + Text: "⏸ PAUSAR" (clearer than icon alone)
- `font-size: 4vh`

**Focus States (for TV remote navigation):**
- Normal: `border: 3px solid rgba(255,255,255,0.3)`
- Focus: `border: 5px solid #FFD700` (gold) + `scale: 1.1`
- Tab order: Voltar → Play/Pause → Pular

**Input Methods:**
1. **TV Remote** (D-pad + Enter) - PRIMARY
2. **Touch** (if Smart TV supports) - SECONDARY
3. **Mobile Remote** (WebSocket) - BACKUP

**Keyboard Shortcuts (bonus for desktop):**
- Space: play/pause
- → : skip
- ← : back
- Esc: exit fullscreen

**Count-up vs Countdown Indicator:**
- Count-up: arrow ↗ in corner
- Countdown: arrow ↘ + more intense color

**Compatibility Testing:**
- Samsung Tizen (most common in Brazil)
- LG webOS
- Generic fallback for other browsers

### 3. Timer Engine

**Problem:** Browser timers drift ~15-20ms/second + throttle in background tabs.

**Solution: Web Worker with Drift Compensation**

```typescript
// timer.worker.ts
class PrecisionTimer {
  private startTime: number;
  private expectedTime: number;

  start() {
    this.startTime = performance.now();
    this.expectedTime = this.startTime + 1000;
    this.tick();
  }

  tick() {
    const now = performance.now();
    const drift = now - this.expectedTime;

    // Compensate drift for next tick
    const nextTick = Math.max(0, 1000 - drift);

    setTimeout(() => {
      this.tick();
      postMessage({
        type: 'TICK',
        elapsed: Math.floor((now - this.startTime) / 1000)
      });
    }, nextTick);

    this.expectedTime += 1000;
  }
}
```

**Features:**
- Runs in Web Worker (immune to throttling)
- `performance.now()` (microsecond precision)
- Accumulated drift compensation
- Target accuracy: <50ms drift per minute

**Audio Alerts:**
- AudioContext API for beeps (no external files needed)
- Vibration API for mobile
- Visual flash on TV (border pulse)

**Execution Modes:**

**Count-up:**
- Timer: 00:00 → 00:01 → 00:02 → ∞
- Coach manually presses "Skip" when done
- Logs `actualDuration = time when skipped`

**Countdown:**
- Timer: 12:00 → 11:59 → ... → 00:00 → beep + auto-advance
- If coach skips early (at 03:00), logs `actualDuration = 09:00`
- Auto-advances to next block on 00:00

### 4. Remote Control Module

**Problem:** Coach needs to control TV execution remotely during class.

**Solution:** Supabase Realtime + Session Codes (unidirectional: mobile → TV)

**Architecture:**

```typescript
// TV: Create session and listen for commands
const sessionCode = generateCode(); // "ABCD12" (6 chars)

const channel = supabase.channel(`session:${sessionCode}`)
  .on('broadcast', { event: 'control' }, ({ action }) => {
    switch(action) {
      case 'play': timer.start(); break;
      case 'pause': timer.pause(); break;
      case 'skip': timer.skipToNext(); break;
      case 'back': timer.goToPrevious(); break;
    }
  })
  .subscribe();

// Display QR code + session code on screen
```

```typescript
// Mobile: Connect and send commands
const channel = supabase.channel(`session:${sessionCode}`);

function control(action: 'play' | 'pause' | 'skip' | 'back') {
  channel.send({
    type: 'broadcast',
    event: 'control',
    payload: { action }
  });
}
```

**UX Flow:**
1. TV displays QR code + "ABCD12" in corner
2. Coach scans QR or types "ABCD12" on mobile
3. Mobile shows control interface (4 large buttons)
4. Latency: <100ms via WebSocket

**Security:**
- Session codes expire in 24h
- Only users from same `box_id` can connect
- RLS validates `box_id` before allowing broadcast

**Fallback:**
- If WebSocket fails, polling every 500ms
- Auto-detect and show warning in UI

**Simplifications:**
- Mobile does NOT sync timer state (unidirectional only)
- Mobile just sends discrete commands
- Much lighter than bidirectional sync (~50 lines vs hundreds)

### 5. Library & Search Module

**Search:**
- Input supports: workout name, date, tags
- Filters: Date range, Tags, Template, Created by
- Results show: Name, Date, Tags, Total duration, Preview (first 3 sections)

**Library View:**
- Group by date (Today, Yesterday, This week, Older)
- Template section separate
- Click workout → opens in editor
- Right-click → Duplicate, Delete, Execute on TV

### 6. Sync & Offline Module

**Strategy: Optimistic UI + Offline Queue + Supabase Realtime**

**Persistence Layers:**
```
1. UI State (Zustand) ← in-memory
2. IndexedDB (Dexie) ← local cache + offline queue
3. Supabase Postgres ← source of truth
```

**Write Flow (create/edit workout):**

```typescript
// 1. Optimistic update
zustandStore.updateWorkout(workout); // UI updates instantly

// 2. Persist locally
await dexie.workouts.put(workout);

// 3. Try sync with backend
if (navigator.onLine) {
  try {
    await supabase.from('workouts').upsert(workout);
    dexie.syncQueue.delete(workout.id); // Success - remove from queue
  } catch (error) {
    dexie.syncQueue.add({ action: 'upsert', table: 'workouts', data: workout });
  }
} else {
  // Offline: add to queue
  dexie.syncQueue.add({ action: 'upsert', table: 'workouts', data: workout });
}
```

**Service Worker + Workbox:**
- Cache static assets (HTML, CSS, JS, fonts)
- Network-first for API calls
- Cache-first for assets
- Background sync for offline queue

**Conflict Resolution:**
- Last-write-wins based on `updated_at`
- UI shows warning if older version detected: "Your version is older, overwrite?"
- Optional: Version history table (v2)

**Real-time Multi-Device Sync:**

```typescript
// Coach edits on mobile → TV updates in real-time
supabase
  .channel(`workout:${workoutId}`)
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'workouts' },
    (payload) => {
      zustandStore.updateWorkout(payload.new);
    }
  )
  .subscribe();
```

**Bandwidth Optimization:**
- During execution: only subscribe to active workout
- Editor: subscribe to today's workout list
- TV mode: only subscribe to control commands

### 7. Authentication & Multi-Tenancy

**Onboarding Flow:**

```
1. Landing: cronotimer.com
   └─> [Criar Box] or [Entrar]

2. Create Box:
   ├─ Box name: "Yellow Monkey CrossFit"
   ├─ Slug: "yellow-monkey" (auto-generated, editable)
   ├─ Admin email: coach@yellowmonkey.com
   ├─ Password
   └─> Creates box + first user (role: owner)

3. Redirect:
   └─> app.cronotimer.com/yellow-monkey/dashboard
```

**Supabase Auth:**
- Email + password (primary method)
- Magic link (v2)
- OAuth Google (v2)
- JWT tokens automatic

**User Management:**

```typescript
Roles:
- owner: CRUD boxes, users, workouts, billing
- coach: CRUD workouts, read users
- athlete: read workouts, execute (read-only)
```

**Session:**
- JWT in localStorage
- Auto-refresh (expires 1h, refresh token valid 7 days)
- Logout clears localStorage + invalidates refresh token
- Same user can be logged in on multiple devices simultaneously

**Isolation:**
- Yellow Monkey NEVER sees workouts from other boxes
- Slugs unique within box (two boxes can have "metcon-dia-1")
- Future billing separated by `box_id`

## Project Structure

```
ymc-cronotimer/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── providers.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── store/
│   │   │
│   │   ├── editor/
│   │   │   ├── components/
│   │   │   │   ├── Canvas.tsx
│   │   │   │   ├── Library.tsx
│   │   │   │   ├── Properties.tsx
│   │   │   │   ├── SectionCard.tsx
│   │   │   │   ├── ExerciseCard.tsx
│   │   │   │   └── RoundCard.tsx
│   │   │   ├── hooks/
│   │   │   └── store/
│   │   │
│   │   ├── execution/
│   │   │   ├── components/
│   │   │   │   ├── TVDisplay.tsx
│   │   │   │   ├── TimerDisplay.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── Controls.tsx
│   │   │   │   └── NextBlock.tsx
│   │   │   ├── hooks/
│   │   │   └── workers/
│   │   │       └── timer.worker.ts
│   │   │
│   │   ├── remote/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   │
│   │   └── library/
│   │       ├── components/
│   │       └── hooks/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   │       ├── supabase.ts
│   │       ├── db.ts (Dexie)
│   │       ├── slugGenerator.ts
│   │       └── timeUtils.ts
│   │
│   ├── types/
│   └── main.tsx
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── config.toml
│
├── public/
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/
    └── plans/
```

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.20.0",
    "typescript": "^5.3.0",
    "zustand": "^4.4.7",
    "@supabase/supabase-js": "^2.39.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.7",
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.1.1",
    "clsx": "^2.1.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4",
    "date-fns": "^3.0.0",
    "nanoid": "^5.0.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "vite-plugin-pwa": "^0.17.4",
    "workbox-window": "^7.0.0",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.2",
    "playwright": "^1.40.0"
  }
}
```

## Testing Strategy

**Unit Tests (Vitest):**
- Timer logic (drift compensation)
- Slug generator
- Time utils (duration parsing, formatting)
- Store mutations (Zustand)

**Integration Tests:**
- Offline queue + sync
- Real-time updates
- RLS policies

**E2E Tests (Playwright):**
- Create complete workout
- Execute on TV
- Remote control connect and command
- Multi-device sync

## Performance Targets

- Lighthouse score > 90 (mobile)
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Timer drift < 50ms/min
- WebSocket latency < 100ms

## Deployment

**CI/CD Pipeline:**
```yaml
- Build: Vite → static assets
- Test: Vitest + Playwright
- Deploy:
  - Frontend → Vercel (auto preview PRs)
  - Migrations → Supabase CLI
- Environments: dev, staging, production
```

**Environment Variables:**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_APP_URL=https://app.cronotimer.com
```

## Roadmap

**Weeks 1-2:** Database schema, migrations, RLS policies, auth setup, PWA shell, wireframes

**Weeks 3-4:** Editor module (sections/exercises/rounds, colors, exclude from total, drag-drop)

**Week 5:** Repeat sequences (x3), copy/paste, templates, slug generation

**Week 6:** TV execution module (timer engine, alerts, controls, auto-hide)

**Week 7:** Library + search (date/name/tags), workout listing

**Week 8:** Offline sync (queue, conflict resolution), remote control (WebSocket)

**Week 9:** QA, accessibility, performance optimization, Smart TV testing, beta launch

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Timer precision in browsers | High | Web Worker + performance.now() + drift compensation |
| Smart TV browser compatibility | High | Test on Samsung Tizen + LG webOS; generic fallback |
| Offline queue conflicts | Medium | Last-write-wins + version history + user warnings |
| WebSocket latency for remote | Medium | Optimistic UI + fallback to polling |
| RLS policy bugs (data leaks) | Critical | Comprehensive integration tests + manual security audit |

## Out of Scope (v1)

- ❌ Native TV app
- ❌ Advanced analytics/reports
- ❌ External integrations (calendar, wearables)
- ❌ Public sharing/social features
- ❌ Payment/billing (noted for backlog)

## Backlog (Post-v1)

- ✅ Admin panel (box management, user management, analytics)
- ✅ Mobile preview of timer state (currently unidirectional)
- ✅ Version history for conflict resolution
- ✅ Magic link auth
- ✅ OAuth providers
- ✅ Advanced search filters
- ✅ Workout analytics and reports

## Success Criteria

**v1 Launch:**
- Yellow Monkey can create, edit, and execute workouts entirely within app
- TV display visible from 15m
- Zero sync failures in common scenarios
- Remote control latency < 200ms
- Offline editing works seamlessly
- Multi-tenant isolation verified (no data leaks)

**User Satisfaction:**
- Time-to-ready for complete workout < 5min
- NPS for TV execution > 60
- >70% of sessions use count-up for clear time tracking

---

**Design Status:** ✅ Approved
**Next Step:** Setup worktree and create implementation plan

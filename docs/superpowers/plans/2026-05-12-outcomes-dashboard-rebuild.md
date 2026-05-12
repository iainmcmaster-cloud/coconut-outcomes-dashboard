# Outcomes Dashboard React Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the single-file vanilla JS outcomes dashboard as a Vite + React + TypeScript app using `@coconut-software/ui`, preserving all data, filters, and functionality while adopting the Coconut design system visual style.

**Architecture:** `App.tsx` owns filter state and all filtering/aggregation logic (ported directly from the original `applyFilters()`). Four reusable `OutcomesTable` instances receive pre-filtered row arrays as props. `KpiTile`, `TopNav`, and `FilterBar` are simple presentational components.

**Tech Stack:** Vite 5, React 18, TypeScript, `@coconut-software/ui`, Tailwind CSS (via `utilities.css`), Vitest + @testing-library/react for tests.

---

## File Map

| File | Role |
|---|---|
| `index.html` | Vite HTML entry (replaces original) |
| `src/main.tsx` | React root mount |
| `src/App.tsx` | Filter state + filtering logic + layout |
| `src/data.ts` | All mock data + helper functions + TypeScript types |
| `src/index.css` | Imports Coconut UI styles + minimal globals |
| `src/components/TopNav.tsx` | Logo, breadcrumb, avatar |
| `src/components/FilterBar.tsx` | 5 filter dropdowns + comparison badge |
| `src/components/KpiTile.tsx` | Single KPI card |
| `src/components/OutcomesTable.tsx` | Reusable sortable outcomes table |
| `src/components/OutcomesTable.test.tsx` | Table tests |
| `src/components/KpiTile.test.tsx` | KPI tile tests |
| `src/data.test.ts` | Helper function unit tests |

---

## Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `index.html`

- [ ] **Step 1.1: Back up the original prototype**

```bash
cd /Users/iain.mcmaster/coconut-outcomes-dashboard
cp index.html index.html.original
```

- [ ] **Step 1.2: Scaffold Vite into the current directory**

```bash
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty. Remove existing files and continue?" — select **Yes** (the original is backed up as `index.html.original`).

Expected output ends with: `Done. Now run: npm install`

- [ ] **Step 1.3: Install dependencies**

```bash
npm install
npm install @coconut-software/ui --legacy-peer-deps
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 1.4: Configure Vitest in `vite.config.ts`**

Replace the contents of `vite.config.ts` with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 1.5: Create test setup file**

Create `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 1.6: Add test script to `package.json`**

In `package.json`, add to the `"scripts"` block:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 1.7: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite prints a local URL (e.g. `http://localhost:5173`). Open it — you should see the default Vite + React starter page. Stop with Ctrl+C.

- [ ] **Step 1.8: Commit scaffold**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

## Task 2: Data layer (`src/data.ts`)

**Files:**
- Create: `src/data.ts`, `src/data.test.ts`

- [ ] **Step 2.1: Write failing tests for helper functions**

Create `src/data.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { sumCounts, pct, fmt } from './data'

describe('sumCounts', () => {
  it('sums all values in an OutcomeCounts object', () => {
    expect(sumCounts({ closedBiz: 10, genOpp: 5, strengthRel: 3, providedInfo: 2, nextSteps: 1, didNotAch: 1, noShow: 1, cancelled: 1, doNotTrack: 1 })).toBe(25)
  })
  it('returns 0 for all-zero counts', () => {
    expect(sumCounts({ closedBiz: 0, genOpp: 0, strengthRel: 0, providedInfo: 0, nextSteps: 0, didNotAch: 0, noShow: 0, cancelled: 0, doNotTrack: 0 })).toBe(0)
  })
})

describe('pct', () => {
  it('returns percentage string to 1 decimal place', () => {
    expect(pct(1, 4)).toBe('25.0')
  })
  it('returns "0.0" when total is 0', () => {
    expect(pct(0, 0)).toBe('0.0')
  })
})

describe('fmt', () => {
  it('formats numbers with locale commas', () => {
    expect(fmt(1658)).toBe('1,658')
  })
  it('handles numbers under 1000', () => {
    expect(fmt(42)).toBe('42')
  })
})
```

- [ ] **Step 2.2: Run tests — verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './data'`

- [ ] **Step 2.3: Create `src/data.ts` with types, helpers, and all mock data**

```ts
// ── Types ────────────────────────────────────────────────────────────────────

export type OutcomeCounts = {
  closedBiz: number
  genOpp: number
  strengthRel: number
  providedInfo: number
  nextSteps: number
  didNotAch: number
  noShow: number
  cancelled: number
  doNotTrack: number
}

export type BaseRow = {
  name: string
  c: OutcomeCounts
  prev: number
}

export type StaffMemberRow = BaseRow & {
  group: string
  location: string
}

export type ExtraCol = {
  key: string
  label: string
}

export type OutcomeDef = {
  key: keyof OutcomeCounts
  label: string
  color: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const sumCounts = (c: OutcomeCounts): number =>
  Object.values(c).reduce((a, b) => a + b, 0)

export const pct = (n: number, t: number): string =>
  t ? (n / t * 100).toFixed(1) : '0.0'

export const fmt = (n: number): string =>
  Number(n).toLocaleString()

export const deltaStr = (curr: number, prev: number): string => {
  const d = ((curr - prev) / prev * 100).toFixed(1)
  return (Number(d) >= 0 ? '▲ +' : '▼ ') + d + '%'
}

export const deltaPp = (curr: number, prev: number): string => {
  const d = (curr - prev).toFixed(1)
  return (Number(d) >= 0 ? '▲ +' : '▼ ') + d + 'pp'
}

export const isUp = (curr: number, prev: number): boolean => curr >= prev

// ── Outcome definitions ───────────────────────────────────────────────────────

export const OUTCOMES: OutcomeDef[] = [
  { key: 'closedBiz',    label: 'Closed New Business',                     color: '#1a7a4a' },
  { key: 'genOpp',       label: 'Generated Opportunity / Lead / Referral',  color: '#34a85a' },
  { key: 'strengthRel',  label: 'Strengthened Client Relationship',         color: '#1A73E8' },
  { key: 'providedInfo', label: 'Provided Information / Education',         color: '#60a5fa' },
  { key: 'nextSteps',    label: 'Established Next Steps',                   color: '#0d9488' },
  { key: 'didNotAch',    label: 'Did Not Achieve Goal',                     color: '#f59e0b' },
  { key: 'noShow',       label: 'No-Show',                                  color: '#ef4444' },
  { key: 'cancelled',    label: 'Cancelled',                                color: '#9ca3af' },
  { key: 'doNotTrack',   label: 'Outcome not tracked',                      color: '#6B7280' },
]

// Keys that get the red badge treatment in tables
export const RED_BADGE_KEYS: (keyof OutcomeCounts)[] = ['noShow', 'cancelled']

// ── Mock data ─────────────────────────────────────────────────────────────────

export const LOCATIONS: BaseRow[] = [
  { name: 'Downtown Branch',           c: { closedBiz: 52, genOpp: 34, strengthRel: 63, providedInfo: 43, nextSteps: 29, didNotAch: 23, noShow: 14, cancelled: 12, doNotTrack: 17 }, prev: 251 },
  { name: 'Westside Financial Center', c: { closedBiz: 44, genOpp: 29, strengthRel: 53, providedInfo: 36, nextSteps: 24, didNotAch: 19, noShow: 12, cancelled: 10, doNotTrack: 16 }, prev: 218 },
  { name: 'Northgate Branch',          c: { closedBiz: 36, genOpp: 24, strengthRel: 43, providedInfo: 29, nextSteps: 20, didNotAch: 16, noShow: 10, cancelled:  8, doNotTrack: 12 }, prev: 181 },
  { name: 'Eastview Office',           c: { closedBiz: 31, genOpp: 21, strengthRel: 38, providedInfo: 26, nextSteps: 18, didNotAch: 14, noShow:  9, cancelled:  7, doNotTrack: 12 }, prev: 161 },
  { name: 'Millbrook Branch',          c: { closedBiz: 27, genOpp: 18, strengthRel: 34, providedInfo: 23, nextSteps: 15, didNotAch: 12, noShow:  8, cancelled:  6, doNotTrack: 11 }, prev: 137 },
  { name: 'Riverside Financial',       c: { closedBiz: 25, genOpp: 17, strengthRel: 31, providedInfo: 21, nextSteps: 14, didNotAch: 11, noShow:  7, cancelled:  6, doNotTrack: 10 }, prev: 128 },
  { name: 'Harbor Point Branch',       c: { closedBiz: 23, genOpp: 15, strengthRel: 28, providedInfo: 19, nextSteps: 13, didNotAch: 10, noShow:  6, cancelled:  5, doNotTrack:  9 }, prev: 113 },
  { name: 'Greenfield Office',         c: { closedBiz: 21, genOpp: 14, strengthRel: 25, providedInfo: 17, nextSteps: 11, didNotAch:  9, noShow:  6, cancelled:  4, doNotTrack:  8 }, prev: 102 },
  { name: 'Lakewood Branch',           c: { closedBiz: 17, genOpp: 12, strengthRel: 22, providedInfo: 15, nextSteps: 10, didNotAch:  7, noShow:  5, cancelled:  4, doNotTrack:  6 }, prev:  88 },
  { name: 'Sunridge Financial Center', c: { closedBiz: 15, genOpp: 10, strengthRel: 19, providedInfo: 13, nextSteps:  9, didNotAch:  7, noShow:  4, cancelled:  3, doNotTrack:  7 }, prev:  79 },
  { name: 'Parkview Branch',           c: { closedBiz: 13, genOpp:  9, strengthRel: 17, providedInfo: 11, nextSteps:  8, didNotAch:  6, noShow:  4, cancelled:  3, doNotTrack:  5 }, prev:  70 },
  { name: 'Valley Office',             c: { closedBiz: 11, genOpp:  7, strengthRel: 14, providedInfo: 10, nextSteps:  6, didNotAch:  5, noShow:  3, cancelled:  2, doNotTrack:  4 }, prev:  57 },
]

export const STAFF_GROUPS: BaseRow[] = [
  { name: 'Senior Financial Advisor', c: { closedBiz: 138, genOpp: 92, strengthRel: 168, providedInfo: 115, nextSteps: 78, didNotAch: 61, noShow: 38, cancelled: 32, doNotTrack: 42 }, prev: 700 },
  { name: 'Advisor',                  c: { closedBiz: 142, genOpp: 95, strengthRel: 173, providedInfo: 118, nextSteps: 81, didNotAch: 63, noShow: 39, cancelled: 33, doNotTrack: 44 }, prev: 722 },
  { name: 'Call Centre',              c: { closedBiz:  35, genOpp: 23, strengthRel:  72, providedInfo:  49, nextSteps: 28, didNotAch: 23, noShow: 14, cancelled: 11, doNotTrack: 21 }, prev: 236 },
]

export const STAFF_MEMBERS: StaffMemberRow[] = [
  { name: 'Sarah Mitchell',    group: 'Senior Financial Advisor', location: 'Downtown Branch',           c: { closedBiz: 22, genOpp: 15, strengthRel: 28, providedInfo: 19, nextSteps: 13, didNotAch: 10, noShow: 6, cancelled: 5, doNotTrack: 7 },  prev: 112 },
  { name: 'James Thornton',    group: 'Senior Financial Advisor', location: 'Westside Financial Center', c: { closedBiz: 20, genOpp: 13, strengthRel: 25, providedInfo: 17, nextSteps: 12, didNotAch:  9, noShow: 5, cancelled: 4, doNotTrack: 6 },  prev:  99 },
  { name: 'Patricia Wong',     group: 'Senior Financial Advisor', location: 'Northgate Branch',          c: { closedBiz: 19, genOpp: 13, strengthRel: 23, providedInfo: 16, nextSteps: 11, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 6 },  prev:  92 },
  { name: 'Robert Chen',       group: 'Senior Financial Advisor', location: 'Eastview Office',           c: { closedBiz: 18, genOpp: 12, strengthRel: 22, providedInfo: 15, nextSteps: 10, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 5 },  prev:  88 },
  { name: 'Linda Kowalski',    group: 'Senior Financial Advisor', location: 'Downtown Branch',           c: { closedBiz: 17, genOpp: 11, strengthRel: 21, providedInfo: 14, nextSteps:  9, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 5 },  prev:  83 },
  { name: 'David Okafor',      group: 'Senior Financial Advisor', location: 'Millbrook Branch',          c: { closedBiz: 16, genOpp: 11, strengthRel: 20, providedInfo: 14, nextSteps:  9, didNotAch:  7, noShow: 4, cancelled: 3, doNotTrack: 5 },  prev:  81 },
  { name: 'Anne-Marie Dubois', group: 'Senior Financial Advisor', location: 'Riverside Financial',       c: { closedBiz: 14, genOpp:  9, strengthRel: 17, providedInfo: 12, nextSteps:  8, didNotAch:  6, noShow: 4, cancelled: 3, doNotTrack: 4 },  prev:  72 },
  { name: 'Carlos Reyes',      group: 'Senior Financial Advisor', location: 'Harbor Point Branch',       c: { closedBiz: 12, genOpp:  8, strengthRel: 12, providedInfo:  8, nextSteps:  6, didNotAch:  5, noShow: 4, cancelled: 5, doNotTrack: 4 },  prev:  68 },
  { name: 'Emily Nakamura',    group: 'Advisor',                  location: 'Downtown Branch',           c: { closedBiz: 20, genOpp: 13, strengthRel: 25, providedInfo: 17, nextSteps: 12, didNotAch:  9, noShow: 5, cancelled: 4, doNotTrack: 6 },  prev: 101 },
  { name: 'Michael Osei',      group: 'Advisor',                  location: 'Westside Financial Center', c: { closedBiz: 18, genOpp: 12, strengthRel: 22, providedInfo: 15, nextSteps: 11, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 7 },  prev:  96 },
  { name: 'Hannah Fitzgerald', group: 'Advisor',                  location: 'Northgate Branch',          c: { closedBiz: 17, genOpp: 11, strengthRel: 21, providedInfo: 14, nextSteps: 10, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 5 },  prev:  89 },
  { name: 'Tom Schreiber',     group: 'Advisor',                  location: 'Eastview Office',           c: { closedBiz: 16, genOpp: 11, strengthRel: 19, providedInfo: 13, nextSteps:  9, didNotAch:  7, noShow: 4, cancelled: 4, doNotTrack: 6 },  prev:  84 },
  { name: 'Priya Sharma',      group: 'Advisor',                  location: 'Millbrook Branch',          c: { closedBiz: 15, genOpp: 10, strengthRel: 18, providedInfo: 12, nextSteps:  9, didNotAch:  7, noShow: 4, cancelled: 3, doNotTrack: 5 },  prev:  80 },
  { name: 'Ben Afolabi',       group: 'Advisor',                  location: 'Riverside Financial',       c: { closedBiz: 14, genOpp:  9, strengthRel: 17, providedInfo: 12, nextSteps:  8, didNotAch:  7, noShow: 4, cancelled: 3, doNotTrack: 5 },  prev:  77 },
  { name: 'Rachel Summers',    group: 'Advisor',                  location: 'Harbor Point Branch',       c: { closedBiz: 13, genOpp:  9, strengthRel: 16, providedInfo: 11, nextSteps:  7, didNotAch:  7, noShow: 4, cancelled: 3, doNotTrack: 4 },  prev:  74 },
  { name: 'Kevin Tran',        group: 'Advisor',                  location: 'Greenfield Office',         c: { closedBiz: 15, genOpp: 10, strengthRel: 20, providedInfo: 14, nextSteps:  8, didNotAch:  6, noShow: 4, cancelled: 3, doNotTrack: 5 },  prev:  78 },
  { name: 'Aisha Mensah',      group: 'Advisor',                  location: 'Lakewood Branch',           c: { closedBiz:  8, genOpp:  5, strengthRel: 10, providedInfo:  7, nextSteps:  5, didNotAch:  4, noShow: 3, cancelled: 2, doNotTrack: 4 },  prev:  45 },
  { name: 'Jordan Blake',      group: 'Advisor',                  location: 'Sunridge Financial Center', c: { closedBiz:  6, genOpp:  4, strengthRel:  8, providedInfo:  6, nextSteps:  5, didNotAch:  3, noShow: 2, cancelled: 2, doNotTrack: 3 },  prev:  39 },
  { name: 'Nicole Perreault',  group: 'Call Centre',              location: 'Downtown Branch',           c: { closedBiz:  7, genOpp:  5, strengthRel: 15, providedInfo: 10, nextSteps:  6, didNotAch:  5, noShow: 3, cancelled: 2, doNotTrack: 4 },  prev:  49 },
  { name: 'Marcus Webb',       group: 'Call Centre',              location: 'Westside Financial Center', c: { closedBiz:  7, genOpp:  4, strengthRel: 14, providedInfo: 10, nextSteps:  5, didNotAch:  5, noShow: 3, cancelled: 2, doNotTrack: 4 },  prev:  48 },
  { name: 'Fatima Al-Hassan',  group: 'Call Centre',              location: 'Northgate Branch',          c: { closedBiz:  6, genOpp:  4, strengthRel: 13, providedInfo:  9, nextSteps:  5, didNotAch:  4, noShow: 2, cancelled: 2, doNotTrack: 4 },  prev:  43 },
  { name: 'Derek Lam',         group: 'Call Centre',              location: 'Eastview Office',           c: { closedBiz:  6, genOpp:  4, strengthRel: 12, providedInfo:  8, nextSteps:  4, didNotAch:  4, noShow: 2, cancelled: 2, doNotTrack: 3 },  prev:  41 },
  { name: 'Simone Beaumont',   group: 'Call Centre',              location: 'Millbrook Branch',          c: { closedBiz:  5, genOpp:  3, strengthRel: 10, providedInfo:  7, nextSteps:  4, didNotAch:  3, noShow: 2, cancelled: 2, doNotTrack: 3 },  prev:  38 },
  { name: 'Omar Hassan',       group: 'Call Centre',              location: 'Downtown Branch',           c: { closedBiz:  4, genOpp:  3, strengthRel:  8, providedInfo:  5, nextSteps:  4, didNotAch:  2, noShow: 2, cancelled: 1, doNotTrack: 3 },  prev:  37 },
]

export const SERVICES: BaseRow[] = [
  { name: 'General Banking',   c: { closedBiz:  62, genOpp: 42, strengthRel:  95, providedInfo: 65, nextSteps: 44, didNotAch: 34, noShow: 21, cancelled: 18, doNotTrack: 28 }, prev: 369 },
  { name: 'Mortgage',          c: { closedBiz:  78, genOpp: 52, strengthRel:  68, providedInfo: 46, nextSteps: 31, didNotAch: 25, noShow: 15, cancelled: 13, doNotTrack: 17 }, prev: 308 },
  { name: 'Investments',       c: { closedBiz:  65, genOpp: 43, strengthRel:  72, providedInfo: 49, nextSteps: 33, didNotAch: 26, noShow: 16, cancelled: 14, doNotTrack: 19 }, prev: 314 },
  { name: 'Loans',             c: { closedBiz:  52, genOpp: 35, strengthRel:  61, providedInfo: 42, nextSteps: 28, didNotAch: 22, noShow: 14, cancelled: 11, doNotTrack: 17 }, prev: 271 },
  { name: 'Credit Cards',      c: { closedBiz:  38, genOpp: 25, strengthRel:  52, providedInfo: 36, nextSteps: 24, didNotAch: 19, noShow: 12, cancelled: 10, doNotTrack: 14 }, prev: 236 },
  { name: 'Open Bank Account', c: { closedBiz:  20, genOpp: 13, strengthRel:  65, providedInfo: 44, nextSteps: 27, didNotAch: 21, noShow: 13, cancelled: 11, doNotTrack: 15 }, prev: 196 },
]
```

- [ ] **Step 2.4: Run tests — verify they pass**

```bash
npm test
```

Expected: 6 tests PASS across `sumCounts`, `pct`, `fmt`.

- [ ] **Step 2.5: Commit**

```bash
git add src/data.ts src/data.test.ts src/test-setup.ts vite.config.ts package.json
git commit -m "feat: add data layer with types, helpers, and mock data"
```

---

## Task 3: `KpiTile` component

**Files:**
- Create: `src/components/KpiTile.tsx`, `src/components/KpiTile.test.tsx`

- [ ] **Step 3.1: Write failing tests**

Create `src/components/KpiTile.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KpiTile from './KpiTile'

describe('KpiTile', () => {
  it('renders the label and value', () => {
    render(<KpiTile label="Total Engagements" value="1,658" delta="▲ +3.2%" direction="up" sub="vs 1,606 prior period" />)
    expect(screen.getByText('Total Engagements')).toBeInTheDocument()
    expect(screen.getByText('1,658')).toBeInTheDocument()
  })

  it('renders the delta text', () => {
    render(<KpiTile label="Total Engagements" value="1,658" delta="▲ +3.2%" direction="up" sub="vs 1,606 prior period" />)
    expect(screen.getByText('▲ +3.2%')).toBeInTheDocument()
  })

  it('renders the sub-label', () => {
    render(<KpiTile label="Outcomes Recorded" value="86.2%" delta="▲ +2.1pp" direction="up" sub="1,429 of 1,658 engagements" />)
    expect(screen.getByText('1,429 of 1,658 engagements')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3.2: Run tests — verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './KpiTile'`

- [ ] **Step 3.3: Create `src/components/KpiTile.tsx`**

```tsx
type Props = {
  label: string
  value: string
  delta: string
  direction: 'up' | 'down' | 'flat'
  sub: string
}

export default function KpiTile({ label, value, delta, direction, sub }: Props) {
  const badgeClass =
    direction === 'up'
      ? 'bg-green-100 text-green-800'
      : direction === 'down'
      ? 'bg-red-100 text-red-800'
      : 'bg-gray-100 text-gray-600'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </div>
      <div className="text-4xl font-bold text-gray-900 leading-none">{value}</div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeClass}`}>
          {delta}
        </span>
        <span className="text-xs text-gray-400">{sub}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3.4: Run tests — verify they pass**

```bash
npm test
```

Expected: All KpiTile tests PASS.

- [ ] **Step 3.5: Commit**

```bash
git add src/components/KpiTile.tsx src/components/KpiTile.test.tsx
git commit -m "feat: add KpiTile component"
```

---

## Task 4: `OutcomesTable` component

**Files:**
- Create: `src/components/OutcomesTable.tsx`, `src/components/OutcomesTable.test.tsx`

- [ ] **Step 4.1: Write failing tests**

Create `src/components/OutcomesTable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import OutcomesTable from './OutcomesTable'
import type { BaseRow } from '../data'

const rows: BaseRow[] = [
  { name: 'Branch A', c: { closedBiz: 10, genOpp: 5, strengthRel: 8, providedInfo: 4, nextSteps: 3, didNotAch: 2, noShow: 1, cancelled: 1, doNotTrack: 1 }, prev: 30 },
  { name: 'Branch B', c: { closedBiz: 20, genOpp: 2, strengthRel: 5, providedInfo: 3, nextSteps: 2, didNotAch: 1, noShow: 2, cancelled: 1, doNotTrack: 1 }, prev: 25 },
]

describe('OutcomesTable', () => {
  it('renders the title', () => {
    render(<OutcomesTable title="Location Detail" rows={rows} firstLabel="Location" />)
    expect(screen.getByText('Location Detail')).toBeInTheDocument()
  })

  it('renders all row names', () => {
    render(<OutcomesTable title="Location Detail" rows={rows} firstLabel="Location" />)
    expect(screen.getByText('Branch A')).toBeInTheDocument()
    expect(screen.getByText('Branch B')).toBeInTheDocument()
  })

  it('renders all 9 outcome column headers in full', () => {
    render(<OutcomesTable title="Location Detail" rows={rows} firstLabel="Location" />)
    expect(screen.getByText('Closed New Business')).toBeInTheDocument()
    expect(screen.getByText('No-Show')).toBeInTheDocument()
    expect(screen.getByText('Outcome not tracked')).toBeInTheDocument()
  })

  it('shows empty state when rows is empty', () => {
    render(<OutcomesTable title="Location Detail" rows={[]} firstLabel="Location" />)
    expect(screen.getByText(/no data matches/i)).toBeInTheDocument()
  })

  it('sorts rows by name column when header is clicked', async () => {
    const user = userEvent.setup()
    render(<OutcomesTable title="Location Detail" rows={rows} firstLabel="Location" />)
    const nameHeader = screen.getByRole('columnheader', { name: /location/i })
    await user.click(nameHeader)
    const cells = screen.getAllByRole('cell')
    expect(cells[0].textContent).toBe('Branch A')
  })
})
```

- [ ] **Step 4.2: Run tests — verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './OutcomesTable'`

- [ ] **Step 4.3: Create `src/components/OutcomesTable.tsx`**

```tsx
import { useState } from 'react'
import { OUTCOMES, RED_BADGE_KEYS, sumCounts, pct, fmt } from '../data'
import type { BaseRow, ExtraCol, OutcomeCounts } from '../data'

type SortDir = 'asc' | 'desc' | null
type SortState = { colIdx: number; dir: SortDir }

type Props = {
  title: string
  rows: (BaseRow & Record<string, unknown>)[]
  firstLabel: string
  extraCols?: ExtraCol[]
}

export default function OutcomesTable({ title, rows, firstLabel, extraCols = [] }: Props) {
  const [sort, setSort] = useState<SortState>({ colIdx: -1, dir: null })

  const totalCols = 1 + extraCols.length + OUTCOMES.length

  const sortedRows = [...rows].sort((a, b) => {
    if (sort.colIdx < 0 || sort.dir === null) return 0
    const { colIdx, dir } = sort
    const extraLen = extraCols.length

    // Name column
    if (colIdx === 0) {
      return dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }

    // Extra string columns (e.g. Staff Group, Location)
    if (colIdx <= extraLen) {
      const key = extraCols[colIdx - 1].key
      const av = String(a[key] ?? '')
      const bv = String(b[key] ?? '')
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }

    // Outcome % columns
    const outcomeIdx = colIdx - 1 - extraLen
    const key = OUTCOMES[outcomeIdx].key
    const totalA = sumCounts(a.c)
    const totalB = sumCounts(b.c)
    const av = parseFloat(pct(a.c[key], totalA))
    const bv = parseFloat(pct(b.c[key], totalB))
    return dir === 'asc' ? av - bv : bv - av
  })

  function handleSort(colIdx: number) {
    setSort(prev => ({
      colIdx,
      dir: prev.colIdx === colIdx && prev.dir === 'desc' ? 'asc' : 'desc',
    }))
  }

  function sortIndicator(colIdx: number) {
    if (sort.colIdx !== colIdx) return ''
    return sort.dir === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <span className="text-xs text-gray-400">{rows.length} row{rows.length !== 1 ? 's' : ''} · sortable</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 cursor-pointer whitespace-nowrap hover:text-blue-600 select-none"
                onClick={() => handleSort(0)}
              >
                {firstLabel}{sortIndicator(0)}
              </th>
              {extraCols.map((ec, i) => (
                <th
                  key={ec.key}
                  className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 cursor-pointer whitespace-nowrap hover:text-blue-600 select-none"
                  onClick={() => handleSort(1 + i)}
                >
                  {ec.label}{sortIndicator(1 + i)}
                </th>
              ))}
              {OUTCOMES.map((o, i) => (
                <th
                  key={o.key}
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-500 border-b border-gray-200 cursor-pointer whitespace-nowrap hover:text-blue-600 select-none min-w-[120px]"
                  onClick={() => handleSort(1 + extraCols.length + i)}
                >
                  {o.label}{sortIndicator(1 + extraCols.length + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-8 text-center text-gray-400">
                  No data matches the current filters.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, ri) => {
                const total = sumCounts(row.c)
                return (
                  <tr key={ri} className="border-t border-gray-50 hover:bg-blue-50">
                    <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                    {extraCols.map(ec => (
                      <td key={ec.key} className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        {String(row[ec.key] ?? '')}
                      </td>
                    ))}
                    {OUTCOMES.map(o => {
                      const n = row.c[o.key as keyof OutcomeCounts] ?? 0
                      const p = pct(n, total)
                      const isRed = RED_BADGE_KEYS.includes(o.key as keyof OutcomeCounts)
                      return (
                        <td key={o.key} className="px-3 py-2 text-right align-middle">
                          {isRed ? (
                            <span className="inline-block bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs font-medium">
                              {p}%
                            </span>
                          ) : (
                            <span className="text-gray-700 font-medium">{p}%</span>
                          )}
                          <div className="text-gray-400 text-xs">{fmt(n)}</div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4.4: Run tests — verify they pass**

```bash
npm test
```

Expected: All OutcomesTable tests PASS.

- [ ] **Step 4.5: Commit**

```bash
git add src/components/OutcomesTable.tsx src/components/OutcomesTable.test.tsx
git commit -m "feat: add OutcomesTable component with sorting and empty state"
```

---

## Task 5: `TopNav` and `FilterBar` components

**Files:**
- Create: `src/components/TopNav.tsx`, `src/components/FilterBar.tsx`

- [ ] **Step 5.1: Create `src/components/TopNav.tsx`**

```tsx
type Props = {
  customerName: string
}

export default function TopNav({ customerName }: Props) {
  return (
    <nav className="bg-white border-b border-gray-200 px-5 h-14 flex items-center gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
          CS
        </div>
        <span className="text-sm font-semibold text-gray-900">Coconut Software</span>
      </div>
      <span className="text-gray-300 text-lg">/</span>
      <span className="text-sm text-gray-500">Meeting Outcomes</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-gray-500">{customerName}</span>
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          IM
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 5.2: Create `src/components/FilterBar.tsx`**

```tsx
type Filters = {
  staffGroup: string
  location: string
  service: string
}

type Props = {
  filters: Filters
  locationOptions: string[]
  onChange: (filters: Filters) => void
}

const STAFF_GROUPS = ['Senior Financial Advisor', 'Advisor', 'Call Centre']
const SERVICES = ['General Banking', 'Mortgage', 'Investments', 'Credit Cards', 'Loans', 'Open Bank Account']

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-700">
      <span className="text-gray-400 font-medium uppercase text-[10px] tracking-wide">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-xs text-gray-800 font-medium cursor-pointer"
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function FilterBar({ filters, locationOptions, onChange }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2 flex-wrap sticky top-14 z-40">
      {/* Display-only filters */}
      <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-700">
        <span className="text-gray-400 font-medium uppercase text-[10px] tracking-wide">Customer</span>
        <span className="font-medium">First National Bank</span>
        <span className="text-gray-400">▾</span>
      </div>
      <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-700">
        <span className="text-gray-400 font-medium uppercase text-[10px] tracking-wide">Date</span>
        <span className="font-medium">Nov 1 – Nov 30, 2024</span>
        <span className="text-gray-400">▾</span>
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Active filters */}
      <FilterSelect
        label="Staff Group"
        value={filters.staffGroup}
        options={STAFF_GROUPS}
        onChange={v => onChange({ ...filters, staffGroup: v })}
      />
      <FilterSelect
        label="Location"
        value={filters.location}
        options={locationOptions}
        onChange={v => onChange({ ...filters, location: v })}
      />
      <FilterSelect
        label="Service"
        value={filters.service}
        options={SERVICES}
        onChange={v => onChange({ ...filters, service: v })}
      />

      <div className="ml-auto bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5 text-xs text-blue-700 font-medium whitespace-nowrap">
        Comparing to: Oct 1 – Oct 31, 2024
      </div>
    </div>
  )
}
```

- [ ] **Step 5.3: Run all tests to confirm nothing broke**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 5.4: Commit**

```bash
git add src/components/TopNav.tsx src/components/FilterBar.tsx
git commit -m "feat: add TopNav and FilterBar components"
```

---

## Task 6: Wire everything in `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 6.1: Replace `src/App.tsx` with the wired dashboard**

```tsx
import { useState, useMemo } from 'react'
import TopNav from './components/TopNav'
import FilterBar from './components/FilterBar'
import KpiTile from './components/KpiTile'
import OutcomesTable from './components/OutcomesTable'
import {
  LOCATIONS, STAFF_GROUPS, STAFF_MEMBERS, SERVICES, OUTCOMES,
  sumCounts, pct, fmt, deltaStr, deltaPp, isUp,
} from './data'
import type { BaseRow, StaffMemberRow, OutcomeCounts } from './data'

type Filters = { staffGroup: string; location: string; service: string }

function aggregateStaffByGroup(members: StaffMemberRow[]): BaseRow[] {
  const groups = [...new Set(members.map(m => m.group))]
  return groups.map(groupName => {
    const inGroup = members.filter(m => m.group === groupName)
    const c = {} as OutcomeCounts
    OUTCOMES.forEach(o => {
      c[o.key] = inGroup.reduce((a, m) => a + (m.c[o.key] ?? 0), 0)
    })
    return { name: groupName, c, prev: inGroup.reduce((a, m) => a + m.prev, 0) }
  })
}

export default function App() {
  const [filters, setFilters] = useState<Filters>({ staffGroup: '', location: '', service: '' })

  const locationOptions = useMemo(
    () => [...LOCATIONS].sort((a, b) => a.name.localeCompare(b.name)).map(l => l.name),
    []
  )

  // --- Filtered row sets (same logic as original applyFilters) ---

  const locRows = useMemo(() =>
    (filters.location ? LOCATIONS.filter(r => r.name === filters.location) : [...LOCATIONS])
      .sort((a, b) => sumCounts(b.c) - sumCounts(a.c)),
    [filters.location]
  )

  const staffRows = useMemo(() => {
    let rows = [...STAFF_MEMBERS]
    if (filters.staffGroup) rows = rows.filter(m => m.group === filters.staffGroup)
    if (filters.location) rows = rows.filter(m => m.location === filters.location)
    return rows.sort((a, b) => sumCounts(b.c) - sumCounts(a.c))
  }, [filters.staffGroup, filters.location])

  const sgRows = useMemo(() => {
    let base: BaseRow[]
    if (filters.location) {
      base = aggregateStaffByGroup(STAFF_MEMBERS.filter(m => m.location === filters.location))
    } else {
      base = [...STAFF_GROUPS]
    }
    if (filters.staffGroup) base = base.filter(r => r.name === filters.staffGroup)
    return base
  }, [filters.location, filters.staffGroup])

  const svcRows = useMemo(() =>
    (filters.service ? SERVICES.filter(r => r.name === filters.service) : [...SERVICES])
      .sort((a, b) => sumCounts(b.c) - sumCounts(a.c)),
    [filters.service]
  )

  // --- KPI computation ---

  const kpiBase = staffRows.length ? staffRows : STAFF_MEMBERS
  const curr = kpiBase.reduce((a, r) => a + sumCounts(r.c), 0)
  const prev = kpiBase.reduce((a, r) => a + r.prev, 0)
  const doNotTrack = kpiBase.reduce((a, r) => a + (r.c.doNotTrack ?? 0), 0)
  const recorded = curr - doNotTrack
  const recPct = parseFloat(pct(recorded, curr))
  const prevRecPct = 84.1

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav customerName="First National Bank" />
      <FilterBar filters={filters} locationOptions={locationOptions} onChange={setFilters} />

      <main className="p-5 max-w-screen-2xl">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 max-w-2xl mb-5">
          <KpiTile
            label="Total Engagements"
            value={fmt(curr)}
            delta={deltaStr(curr, prev)}
            direction={isUp(curr, prev) ? 'up' : 'down'}
            sub={`vs ${fmt(prev)} prior period`}
          />
          <KpiTile
            label="Outcomes Recorded"
            value={`${recPct.toFixed(1)}%`}
            delta={deltaPp(recPct, prevRecPct) + ' vs prior period'}
            direction={isUp(recPct, prevRecPct) ? 'up' : 'down'}
            sub={`${fmt(recorded)} of ${fmt(curr)} engagements`}
          />
        </div>

        <OutcomesTable title="Location Detail"    rows={locRows}   firstLabel="Location"   />
        <OutcomesTable title="Staff Group Detail" rows={sgRows}    firstLabel="Staff Group" />
        <OutcomesTable
          title="Staff Detail"
          rows={staffRows as (BaseRow & Record<string, unknown>)[]}
          firstLabel="Staff Name"
          extraCols={[{ key: 'group', label: 'Staff Group' }, { key: 'location', label: 'Location' }]}
        />
        <OutcomesTable title="Service Detail"     rows={svcRows}   firstLabel="Service"    />
      </main>
    </div>
  )
}
```

- [ ] **Step 6.2: Run all tests**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 6.3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire App.tsx with filter state and all four tables"
```

---

## Task 7: Styles and `main.tsx`

**Files:**
- Modify: `src/index.css`, `src/main.tsx`

- [ ] **Step 7.1: Replace `src/index.css`**

```css
@import '@coconut-software/ui/dist/utilities.css';

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', 'Roboto', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 7.2: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 7.3: Start the dev server and verify the dashboard renders**

```bash
npm run dev
```

Open the printed URL. Verify:
- Nav bar shows "Coconut Software / Meeting Outcomes" with "IM" avatar on right
- Two KPI tiles with bold numbers and green badges
- Four sortable tables, each with all 9 outcome columns in full labels
- Clicking Staff Group, Location, or Service dropdowns filters the tables
- Clicking any column header sorts that column; clicking again reverses sort
- Filtering to a single location aggregates Staff Group table from staff members at that location
- No-Show and Cancelled columns show red badge percentages

- [ ] **Step 7.4: Commit**

```bash
git add src/index.css src/main.tsx
git commit -m "feat: apply Coconut UI styles and finalize entry point"
```

---

## Task 8: Clean up and final commit

**Files:**
- Delete: `src/App.css`, `src/assets/` (Vite scaffold defaults, not needed)
- Modify: `index.html` (update title)

- [ ] **Step 8.1: Remove unused scaffold files**

```bash
rm -f src/App.css
rm -rf src/assets
```

- [ ] **Step 8.2: Update page title in `index.html`**

In `index.html`, change:
```html
<title>Vite + React + TS</title>
```
to:
```html
<title>Meeting Outcomes — Coconut Software</title>
```

- [ ] **Step 8.3: Run all tests one final time**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 8.4: Final commit**

```bash
git add -A
git commit -m "feat: complete React rebuild of Meeting Outcomes dashboard"
```

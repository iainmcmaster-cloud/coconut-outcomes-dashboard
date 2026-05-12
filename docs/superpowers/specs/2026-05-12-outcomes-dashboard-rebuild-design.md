# Meeting Outcomes Dashboard — React Rebuild Design

**Date:** 2026-05-12  
**Status:** Approved  

## Overview

Rebuild the existing single-file `index.html` Meeting Outcomes prototype as a Vite + React + TypeScript app using `@coconut-software/ui` for UI components. The rebuild preserves all existing data, filters, and functionality while adopting the Coconut design system visual style.

## Tech Stack

- **Framework:** Vite + React + TypeScript
- **UI library:** `@coconut-software/ui` (components + `utilities.css`)
- **Location:** `/Users/iain.mcmaster/coconut-outcomes-dashboard` (same folder, replaces `index.html`)
- **Data:** Same mock data as the original — no API integration

## Visual Design

Coconut design system style:
- White top nav with Coconut blue (`#0066CC`) branding, not the dark `#1C2B3A` nav from the original
- Filter bar with labeled dropdowns (bordered, rounded-6px)
- KPI tiles: bold (`font-weight: 700`) large numbers, green/red badge-style delta indicators
- Table cards: white surface, rounded-10px, subtle shadow, `#F9FAFB` header row
- Outcome cell format: `%` on top, raw count below in muted grey
- No-show and Cancelled cells use red badge highlight; neutral grey badge for other notable values
- All 9 outcome column labels shown in full — no abbreviations

## File Structure

```
coconut-outcomes-dashboard/
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── data.ts
│   ├── index.css
│   └── components/
│       ├── TopNav.tsx
│       ├── FilterBar.tsx
│       ├── KpiTile.tsx
│       └── OutcomesTable.tsx
├── docs/
│   └── superpowers/specs/  ← this file
└── package.json
```

## Component Specifications

### `data.ts`
Exports the mock data arrays unchanged from the original:
- `OUTCOMES` — 9 outcome definitions (key, label, color)
- `LOCATIONS` — 12 location rows with outcome counts + `prev`
- `STAFF_GROUPS` — 3 staff group rows
- `STAFF_MEMBERS` — 24 staff rows with `group` and `location` fields
- `SERVICES` — 6 service rows
- Helper functions: `sumCounts(c)`, `pct(n, t)`, `fmt(n)`

### `App.tsx`
- Owns filter state: `staffGroup`, `location`, `service` (all strings, default `""`)
- Populates location dropdown options from `LOCATIONS`
- Contains `applyFilters()` logic (ported from original):
  - Location table: filtered by `location`
  - Staff Group table: aggregated from `STAFF_MEMBERS` when location filter active, then filtered by `staffGroup`
  - Staff table: filtered by both `staffGroup` and `location`, sorted by total descending
  - Service table: filtered by `service`
  - KPI base: uses current staff rows (or all staff if no staff filters active)
- Renders: `TopNav`, `FilterBar`, two `KpiTile`s, four `OutcomesTable`s

### `TopNav.tsx`
Props: `customerName: string`  
Renders: CS logo mark, "Coconut Software" brand, "/" separator, "Meeting Outcomes" breadcrumb, customer name + avatar (initials "IM") on the right.

### `FilterBar.tsx`
Props: `filters`, `onChange`, `locationOptions: string[]`  
Renders 5 labeled select dropdowns (Customer, Date, Staff Group, Location, Service) + comparison period badge. Customer and Date are display-only (not wired to filter logic, matching original behaviour). Staff Group, Location, and Service call `onChange`.

### `KpiTile.tsx`
Props: `label: string`, `value: string`, `delta: string`, `deltaDirection: "up" | "down" | "flat"`, `sub: string`  
Renders a white card with uppercase label, large bold value, coloured badge delta, and muted sub-label.

### `OutcomesTable.tsx`
Props:
- `id: string` — used for sort state key
- `title: string`
- `rows: Row[]` — each row has `name`, `c` (outcome counts object), and optional extra string fields
- `firstLabel: string` — header for the name column
- `extraCols?: { key: string; label: string }[]` — additional columns before outcome columns (e.g. Staff Group, Location for the staff table)

Behaviour:
- Renders a white card with title header and row count
- All 9 outcome columns shown in full label, text-right aligned
- Each outcome cell shows `%` (larger) above raw count (smaller, muted)
- No-show and Cancelled columns use red badge on the percentage; other columns plain text
- Column headers are clickable to sort ascending/descending (same logic as original `sortCol`)
- Empty state row shown when `rows` is empty

## Data Flow

```
App.tsx (filter state)
  ├── FilterBar.tsx  ← reads/writes filter state
  ├── KpiTile × 2   ← receives computed curr/prev/pct values
  └── OutcomesTable × 4
        ├── loc-table  (LOCATIONS filtered)
        ├── sg-table   (STAFF_GROUPS filtered/aggregated)
        ├── staff-table (STAFF_MEMBERS filtered)
        └── svc-table  (SERVICES filtered)
```

## Implementation Note — Coconut UI Component Names

The Storybook at `https://coconutcalendar.github.io` was not accessible during design. Before implementing each component, run:

```bash
node -e "const ui = require('@coconut-software/ui'); console.log(Object.keys(ui))"
```

This lists all exported component names. Use the closest match for Select, Card/surface, and Badge. Fall back to Tailwind utility classes from `utilities.css` for anything not available as a named component.

## What Is Not Changing

- All mock data values are preserved exactly
- Filter logic is a direct port of the original `applyFilters()`
- Sort logic is a direct port of the original `sortCol()`
- The 9 outcome definitions and their order are unchanged
- Customer and Date filters remain display-only (no live filtering)

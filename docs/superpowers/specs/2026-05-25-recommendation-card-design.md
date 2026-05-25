# RecommendationCard + RecommendationFeed — Design Spec

**Date:** 2026-05-25
**Project:** coconut-outcomes-dashboard
**Status:** Approved

---

## Overview

Two components:

- **`RecommendationCard`** — single actionable recommendation. Handles act and dismiss interactions with animations.
- **`RecommendationFeed`** — manages a queue of 12+ recommendations, displays 4 at a time, cycles in the next card when one is removed, and provides a priority selector that reorders the waiting queue.

The feed sits above the existing homepage content (KPI tiles, charts) as a full-width section.

---

## Part 1 — RecommendationCard

### Props

```ts
export type Dimension = 'Growth' | 'Productivity' | 'Customer Experience'
export type DismissReason = 'Not relevant' | 'Already done' | 'Do later'

export interface RecommendationCardProps {
  title: string
  context: string         // One line; truncated with ellipsis if overflow
  impact: string          // Projected impact string
  dimension: Dimension
  ctaLabel: string
  onAct: () => void       // Called immediately on CTA click; animation plays concurrently
  onDismiss: (reason: DismissReason) => void  // Called after reason is selected
}
```

### Visual design

**Theme:** Light — white cards on a light gray page, matching the existing dashboard aesthetic.

**Card container:** `bg-white border border-gray-200 rounded-xl shadow-sm p-5`

**Dimension badge** (top of card, `text-xs font-bold uppercase tracking-wide px-3 py-0.5 rounded-full`):

| Dimension | Classes |
|---|---|
| Growth | `bg-emerald-100 text-emerald-700` |
| Productivity | `bg-blue-100 text-blue-700` |
| Customer Experience | `bg-violet-100 text-violet-700` |

**Title:** `text-[15px] font-bold text-gray-900 leading-snug mt-3`

**Context line:** `text-xs text-gray-500 mt-1.5 truncate`

**Impact box:**
- Container: `bg-teal-50 border border-[#00B4B4] rounded-md p-2.5 mt-3`
- Label: `text-[10px] font-semibold text-[#00B4B4] uppercase tracking-wide`
- Value: `text-xs text-emerald-800 font-medium mt-0.5`

**Button row** (`flex gap-2 mt-4`):
- CTA: `flex-1 bg-[#00B4B4] text-white text-xs font-semibold rounded-md py-1.5`
- Dismiss: `flex-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-md py-1.5`

### State machine

```
idle → acting     (CTA clicked)
idle → dismissing (Dismiss clicked)
dismissing → dismissed (reason selected)
```

**`idle`:** Full card (badge → title → context → impact box → buttons).

**`acting`:** `onAct()` called immediately. Card translates up + fades (`-translate-y-4 opacity-0`, 300ms ease-out). Outer wrapper collapses height (`max-h-[400px] → max-h-0`, 300ms).

**`dismissing`:** Card body cross-fades to reason prompt (150ms). Dimension badge stays. Body shows:
- Heading: `text-sm font-semibold text-gray-700` — "Why are you dismissing this?"
- Three buttons (`w-full text-left text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 hover:bg-gray-100`): "Not relevant" · "Already done" · "Do later"

**`dismissed`:** `onDismiss(reason)` called. Card fades + scales (`opacity-0 scale-95`, 200ms). Outer wrapper collapses height after 200ms delay (300ms).

### Animation summary

| Event | Inner card | Outer wrapper |
|---|---|---|
| CTA clicked | `-translate-y-4 opacity-0` 300ms | `max-h-[400px] → max-h-0` 300ms |
| Reason selected | `opacity-0 scale-95` 200ms | `max-h-[400px] → max-h-0` 300ms, 200ms delay |
| Reason prompt appears | `opacity-0 → opacity-100` 150ms cross-fade | unchanged |

All transitions use Tailwind `transition-all ease-out`.

---

## Part 2 — RecommendationFeed

### Props

```ts
export interface RecommendationFeedProps {
  recommendations?: Recommendation[]  // defaults to built-in mock dataset
}
```

### Recommendation data shape

```ts
export interface Recommendation {
  id: string
  title: string
  context: string
  impact: string
  dimension: Dimension
  ctaLabel: string
}
```

### Mock dataset (12 items)

4 per dimension, ordered Growth → Productivity → Customer Experience:

| # | Dimension | Title | ctaLabel |
|---|---|---|---|
| 1 | Growth | Reduce mortgage lead times | Take Action |
| 2 | Growth | Enable walk-in appointments | Configure |
| 3 | Growth | Expand high-value advisor hours | Schedule |
| 4 | Growth | Launch referral incentive program | Review |
| 5 | Productivity | Simplify your service menu | Configure |
| 6 | Productivity | Automate appointment reminders | Enable |
| 7 | Productivity | Reduce no-show rate with confirmations | Enable |
| 8 | Productivity | Consolidate duplicate service types | Review |
| 9 | Customer Experience | Improve lobby wait time visibility | Enable |
| 10 | Customer Experience | Add post-visit feedback collection | Set Up |
| 11 | Customer Experience | Enable self-serve rescheduling | Enable |
| 12 | Customer Experience | Surface next-best product offers | Configure |

### State shape (Approach A — explicit active + sorted waiting)

```ts
// Stored
allRecs:    Recommendation[]  // master list, never mutated
activeIds:  string[]          // ids of the ≤4 currently visible cards (insertion-ordered)
removed:    Set<string>       // ids of acted/dismissed cards
priority:   Dimension | null  // active priority filter (null = original order)
newCardId:  string | null     // id of card currently playing entrance animation

// Derived (never stored)
waiting = sortByPriority(
  allRecs.filter(r => !removed.has(r.id) && !activeIds.includes(r.id)),
  priority
)
```

`activeIds` is the source of truth for what is visible. Priority changes re-sort only `waiting`; `activeIds` is never touched by a priority change. When a card is removed, the first item from `waiting` is appended to `activeIds` and set as `newCardId`.

### Priority selector behaviour

- Rendered above the card row: label "Priority" + 3 pill buttons (Growth / Productivity / Customer Experience)
- Active priority pill: `bg-[#00B4B4] text-white`; inactive: `bg-white text-gray-500 border border-gray-200`
- Clicking a pill re-sorts `queue` so that dimension floats to the front (stable sort preserving relative order within groups). Currently visible 4 cards are unaffected.
- Clicking the active priority again resets to default order.
- A "X remaining" counter (`text-xs text-gray-400`) sits at the far right of the selector row.

### Card entrance animation

When a card is appended to `activeIds` (a new card enters the visible window):
1. Set `newCardId` to the incoming card's id.
2. That card renders with `translate-x-8 opacity-0`, transitions to `translate-x-0 opacity-100` over 300ms ease-out.
3. After 300ms, clear `newCardId`.

### Empty state

When all recommendations are removed: replace the card row with a centred message — `"You're all caught up."` in `text-sm text-gray-400`.

### Layout

```
<section>
  <div>  ← priority selector row (flex, items-center, gap-3, mb-4)
  <div>  ← card grid (grid grid-cols-4 gap-3)
</section>
```

The feed section is placed above the existing KPI tiles in `App.tsx`.

---

## File structure

```
src/
  components/
    RecommendationCard.tsx
    RecommendationCard.test.tsx
    RecommendationFeed.tsx
    RecommendationFeed.test.tsx
  data/
    recommendations.ts      ← mock dataset + Recommendation type
```

Types `Dimension` and `DismissReason` are exported from `RecommendationCard.tsx` and re-used by the feed.

---

## Testing scope

**RecommendationCard:**
- Renders all props in idle state
- `onAct` called immediately on CTA click
- Dismiss transitions to reason prompt; badge remains visible
- Each reason button calls `onDismiss` with correct string

**RecommendationFeed:**
- Renders first 4 recommendations on mount
- Acting on card #1 removes it; card #5 becomes active
- Dismissing card #2 removes it; card #5 (or #6) becomes active
- Priority pill reorders waiting queue; active 4 unchanged
- All 12 removed → empty state renders

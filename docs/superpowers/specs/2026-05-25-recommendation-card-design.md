# RecommendationCard — Design Spec

**Date:** 2026-05-25
**Project:** coconut-outcomes-dashboard
**Status:** Approved

---

## Overview

A React component that surfaces AI-generated recommendations to dashboard users. Cards appear as a horizontal row above the existing homepage content (KPI tiles, charts). Each card represents a single actionable recommendation with a dimension, context, projected impact, and two actions: act or dismiss.

---

## Props

```ts
export type Dimension = 'Growth' | 'Productivity' | 'Customer Experience'
export type DismissReason = 'Not relevant' | 'Already done' | 'Do later'

interface RecommendationCardProps {
  title: string           // Bold headline, e.g. "Reduce mortgage lead times."
  context: string         // One-line supporting text, truncated with ellipsis if overflow
  impact: string          // Projected impact string, e.g. "+12% customer retention over 90 days"
  dimension: Dimension
  ctaLabel: string        // Label for the primary action button
  onAct: () => void       // Called immediately on CTA click; animation plays concurrently
  onDismiss: (reason: DismissReason) => void  // Called after user selects a reason
}
```

---

## Visual Design

**Theme:** Light — matches the existing Figma/dashboard aesthetic (white cards, light gray page background).

**Card container:**
- Background: `bg-white`
- Border: `border border-gray-200` with `rounded-xl`
- Shadow: `shadow-sm`
- Padding: `p-5`
- Width: equal flex columns in a 4-up grid row; minimum ~240px

**Dimension badge (top of card):**
| Dimension | Background | Text |
|---|---|---|
| Growth | `bg-emerald-100` | `text-emerald-700` |
| Productivity | `bg-blue-100` | `text-blue-700` |
| Customer Experience | `bg-violet-100` | `text-violet-700` |

Style: `text-xs font-bold uppercase tracking-wide px-3 py-0.5 rounded-full`

**Title:** `text-[15px] font-bold text-gray-900 leading-snug mt-3`

**Context line:** `text-xs text-gray-500 mt-1.5 truncate`

**Impact box:**
- Background: `bg-teal-50`
- Border: `border border-[#00B4B4] rounded-md`
- Padding: `p-2.5`
- Label: `text-[10px] font-semibold text-[#00B4B4] uppercase tracking-wide`
- Value: `text-xs text-emerald-800 font-medium mt-0.5`

**Buttons (bottom row, full-width split):**
- CTA: `bg-[#00B4B4] text-white text-xs font-semibold rounded-md py-1.5 flex-1`
- Dismiss: `bg-gray-100 text-gray-500 text-xs font-medium rounded-md py-1.5 flex-1`

---

## State Machine

```
idle → acting     (CTA clicked)
idle → dismissing (Dismiss clicked)
dismissing → dismissed (reason selected)
acting / dismissed → gone (animation complete, parent removes card)
```

**`idle`:** Full card renders (badge, title, context, impact box, buttons).

**`acting`:** `onAct()` is called immediately. Card animates out (`-translate-y-4 opacity-0`, 300ms ease-out). Outer wrapper height collapses to `0` (`max-h-0 overflow-hidden`, 300ms) so siblings reflow without a jump.

**`dismissing`:** Card body cross-fades to the reason prompt. The dimension badge stays visible. A heading "Why are you dismissing this?" appears above three full-width buttons: "Not relevant", "Already done", "Do later".

**`dismissed`:** User selected a reason. `onDismiss(reason)` is called. Card fades and scales down (`opacity-0 scale-95`, 200ms), then outer wrapper collapses height.

---

## Reason Prompt (dismissing state)

Replaces the title/context/impact/buttons area. Badge stays.

```
[ Why are you dismissing this? ]   ← text-sm font-semibold text-gray-700

[ Not relevant  ]   ← outlined button, full width
[ Already done  ]
[ Do later      ]
```

Button style: `w-full text-left text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 hover:bg-gray-100`

---

## Animation Summary

| Event | Inner card | Outer wrapper |
|---|---|---|
| CTA clicked | `-translate-y-4 opacity-0` over 300ms | `max-h-[400px] → max-h-0` over 300ms |
| Reason selected | `opacity-0 scale-95` over 200ms | `max-h-[400px] → max-h-0` over 300ms (after 200ms delay) |
| Reason prompt appears | `opacity-0 → 1` over 150ms cross-fade | no change |

All transitions use Tailwind's `transition-all` with `duration-300` / `duration-200` and `ease-out`.

---

## File Structure

```
src/
  components/
    RecommendationCard.tsx    ← single file, self-contained
    RecommendationCard.test.tsx
```

No sub-components needed. State is internal (`useState`). No context, no store.

---

## Testing

- Renders all props correctly in idle state
- Calls `onAct` immediately on CTA click
- Clicking Dismiss transitions to reason prompt (badge visible, body replaced)
- Each reason button calls `onDismiss` with the correct reason string
- Context line truncates at one line (CSS only — no logic test needed)

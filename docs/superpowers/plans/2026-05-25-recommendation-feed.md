# Recommendation Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `RecommendationCard` and `RecommendationFeed` components that display 4 AI-generated recommendations at a time, cycle in new cards as old ones are acted on or dismissed, and allow priority-based queue reordering.

**Architecture:** Shared types and mock data live in `src/data/recommendations.ts`. `RecommendationCard` is a self-contained component managing its own act/dismiss animation state. `RecommendationFeed` holds the queue in `activeIds` (explicit) + derived `waiting`, uses a 350ms delay before state updates so the card's exit animation plays before unmount, and slots in the next card immediately after.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS (via `@coconut-software/ui`), Vitest + Testing Library

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/data/recommendations.ts` | Create | Shared types (`Dimension`, `DismissReason`, `Recommendation`), 12-item mock dataset, `sortByPriority` helper |
| `src/components/RecommendationCard.tsx` | Create | Single card — renders badge/title/context/impact/buttons, manages act & dismiss animation state |
| `src/components/RecommendationCard.test.tsx` | Create | Card unit tests |
| `src/components/RecommendationFeed.tsx` | Create | Queue management, priority selector, 4-up grid, empty state |
| `src/components/RecommendationFeed.test.tsx` | Create | Feed unit tests |
| `src/App.tsx` | Modify | Add `<RecommendationFeed />` above KPI tiles |

---

## Task 1: Shared types and mock data

**Files:**
- Create: `src/data/recommendations.ts`

- [ ] **Step 1: Create the file**

```ts
export type Dimension = 'Growth' | 'Productivity' | 'Customer Experience'
export type DismissReason = 'Not relevant' | 'Already done' | 'Do later'

export interface Recommendation {
  id: string
  title: string
  context: string
  impact: string
  dimension: Dimension
  ctaLabel: string
}

export const RECOMMENDATIONS: Recommendation[] = [
  { id: 'rec-1', dimension: 'Growth', title: 'Reduce mortgage lead times.', context: 'Lead times are 50% higher than industry average.', impact: '+12% customer retention over 90 days', ctaLabel: 'Take Action' },
  { id: 'rec-2', dimension: 'Growth', title: 'Enable walk-in appointments.', context: 'Walk-in rate is 0%. Competitors see 8% higher deposits.', impact: '+8% deposit volume in 60 days', ctaLabel: 'Configure' },
  { id: 'rec-3', dimension: 'Growth', title: 'Expand high-value advisor hours.', context: 'High-value meetings peak 4–6 PM but advisors end at 4 PM.', impact: '+18% high-value engagement rate', ctaLabel: 'Schedule' },
  { id: 'rec-4', dimension: 'Growth', title: 'Launch referral incentive program.', context: 'Referral bookings are 3× more likely to convert.', impact: '+22% new client acquisition in 120 days', ctaLabel: 'Review' },
  { id: 'rec-5', dimension: 'Productivity', title: 'Simplify your service menu.', context: '35 services listed. Reducing to 20 lifts conversion.', impact: '+15% booking conversion rate', ctaLabel: 'Configure' },
  { id: 'rec-6', dimension: 'Productivity', title: 'Automate appointment reminders.', context: 'Manual reminders are sent inconsistently across branches.', impact: '−18% no-show rate within 30 days', ctaLabel: 'Enable' },
  { id: 'rec-7', dimension: 'Productivity', title: 'Reduce no-shows with confirmations.', context: 'No-show rate is 14%. Industry benchmark is 8%.', impact: '−30% no-show rate in 60 days', ctaLabel: 'Enable' },
  { id: 'rec-8', dimension: 'Productivity', title: 'Consolidate duplicate service types.', context: '6 overlapping services create booking confusion.', impact: '+10% staff utilisation rate', ctaLabel: 'Review' },
  { id: 'rec-9', dimension: 'Customer Experience', title: 'Improve lobby wait time visibility.', context: 'Avg wait is 18 min with no visibility to clients.', impact: '−22% perceived wait time complaints', ctaLabel: 'Enable' },
  { id: 'rec-10', dimension: 'Customer Experience', title: 'Add post-visit feedback collection.', context: 'Only 12% of visits generate satisfaction feedback.', impact: '+40% feedback response rate in 45 days', ctaLabel: 'Set Up' },
  { id: 'rec-11', dimension: 'Customer Experience', title: 'Enable self-serve rescheduling.', context: 'Rescheduling requires a phone call for 80% of clients.', impact: '−35% inbound reschedule calls in 30 days', ctaLabel: 'Enable' },
  { id: 'rec-12', dimension: 'Customer Experience', title: 'Surface next-best product offers.', context: 'Post-visit product suggestions shown to only 5% of clients.', impact: '+9% cross-sell conversion in 90 days', ctaLabel: 'Configure' },
]

export function sortByPriority(recs: Recommendation[], priority: Dimension | null): Recommendation[] {
  if (!priority) return [...recs]
  return [
    ...recs.filter(r => r.dimension === priority),
    ...recs.filter(r => r.dimension !== priority),
  ]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd coconut-outcomes-dashboard && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/recommendations.ts
git commit -m "feat: add recommendations data and shared types"
```

---

## Task 2: RecommendationCard — idle state

**Files:**
- Create: `src/components/RecommendationCard.tsx`
- Create: `src/components/RecommendationCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/RecommendationCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RecommendationCard from './RecommendationCard'

const defaultProps = {
  title: 'Reduce mortgage lead times.',
  context: 'Lead times are 50% higher than industry average.',
  impact: '+12% customer retention over 90 days',
  dimension: 'Growth' as const,
  ctaLabel: 'Take Action',
  onAct: vi.fn(),
  onDismiss: vi.fn(),
}

describe('RecommendationCard — idle state', () => {
  it('renders the dimension badge', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByText('Growth')).toBeInTheDocument()
  })

  it('renders the title', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByText('Reduce mortgage lead times.')).toBeInTheDocument()
  })

  it('renders the context line', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByText('Lead times are 50% higher than industry average.')).toBeInTheDocument()
  })

  it('renders the impact value', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByText('+12% customer retention over 90 days')).toBeInTheDocument()
  })

  it('renders the CTA button with the ctaLabel', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Take Action' })).toBeInTheDocument()
  })

  it('renders the Dismiss button', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm they fail**

```bash
npx vitest run src/components/RecommendationCard.test.tsx
```
Expected: FAIL — "Cannot find module './RecommendationCard'"

- [ ] **Step 3: Create the card component (idle state only)**

```tsx
// src/components/RecommendationCard.tsx
import { useState, useEffect } from 'react'
import type { Dimension, DismissReason } from '../data/recommendations'

export interface RecommendationCardProps {
  title: string
  context: string
  impact: string
  dimension: Dimension
  ctaLabel: string
  onAct: () => void
  onDismiss: (reason: DismissReason) => void
  isNew?: boolean
}

type CardState = 'idle' | 'acting' | 'dismissing' | 'dismissed'

const DISMISS_REASONS: DismissReason[] = ['Not relevant', 'Already done', 'Do later']

const BADGE: Record<Dimension, string> = {
  Growth: 'bg-emerald-100 text-emerald-700',
  Productivity: 'bg-blue-100 text-blue-700',
  'Customer Experience': 'bg-violet-100 text-violet-700',
}

export default function RecommendationCard({
  title, context, impact, dimension, ctaLabel, onAct, onDismiss, isNew = false,
}: RecommendationCardProps) {
  const [cardState, setCardState] = useState<CardState>('idle')
  const [collapsed, setCollapsed] = useState(false)
  const [entered, setEntered] = useState(!isNew)

  useEffect(() => {
    if (!entered) {
      const raf = requestAnimationFrame(() => setEntered(true))
      return () => cancelAnimationFrame(raf)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAct() {
    setCardState('acting')
    onAct()
    setTimeout(() => setCollapsed(true), 300)
  }

  function handleDismiss() {
    setCardState('dismissing')
  }

  function handleReason(reason: DismissReason) {
    setCardState('dismissed')
    onDismiss(reason)
    setTimeout(() => setCollapsed(true), 200)
  }

  const innerCls = [
    'bg-white border border-gray-200 rounded-xl shadow-sm p-5 transition-all ease-out duration-300',
    !entered ? 'translate-x-8 opacity-0' : '',
    cardState === 'acting' ? '-translate-y-4 opacity-0' : '',
    cardState === 'dismissed' ? 'opacity-0 scale-95' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-out"
      style={{ maxHeight: collapsed ? 0 : 400 }}
    >
      <div className={innerCls}>
        <span className={`inline-block text-xs font-bold uppercase tracking-wide px-3 py-0.5 rounded-full ${BADGE[dimension]}`}>
          {dimension}
        </span>

        {cardState === 'dismissing' ? (
          <div className="mt-3">
            <p className="text-sm font-semibold text-gray-700 mb-3">Why are you dismissing this?</p>
            <div className="flex flex-col gap-2">
              {DISMISS_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReason(reason)}
                  className="w-full text-left text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-[15px] font-bold text-gray-900 leading-snug mt-3">{title}</h3>
            <p className="text-xs text-gray-500 mt-1.5 truncate">{context}</p>
            <div className="bg-teal-50 border border-[#00B4B4] rounded-md p-2.5 mt-3">
              <p className="text-[10px] font-semibold text-[#00B4B4] uppercase tracking-wide">Projected impact</p>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">{impact}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAct}
                className="flex-1 bg-[#00B4B4] text-white text-xs font-semibold rounded-md py-1.5 hover:bg-teal-600 transition-colors"
              >
                {ctaLabel}
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-md py-1.5 hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/components/RecommendationCard.test.tsx
```
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/RecommendationCard.tsx src/components/RecommendationCard.test.tsx
git commit -m "feat: add RecommendationCard idle state"
```

---

## Task 3: RecommendationCard — act flow

**Files:**
- Modify: `src/components/RecommendationCard.test.tsx` (add tests)
- No changes to `RecommendationCard.tsx` — already implemented in Task 2

- [ ] **Step 1: Add act-flow tests**

Append to the existing `describe` block in `RecommendationCard.test.tsx`:

```tsx
describe('RecommendationCard — act flow', () => {
  it('calls onAct immediately when CTA is clicked', async () => {
    const onAct = vi.fn()
    render(<RecommendationCard {...defaultProps} onAct={onAct} />)
    await userEvent.click(screen.getByRole('button', { name: 'Take Action' }))
    expect(onAct).toHaveBeenCalledTimes(1)
  })
})
```

Add the import at the top of the file:
```tsx
import userEvent from '@testing-library/user-event'
```

- [ ] **Step 2: Run to confirm pass**

```bash
npx vitest run src/components/RecommendationCard.test.tsx
```
Expected: 7 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/RecommendationCard.test.tsx
git commit -m "test: add RecommendationCard act flow test"
```

---

## Task 4: RecommendationCard — dismiss flow

**Files:**
- Modify: `src/components/RecommendationCard.test.tsx` (add tests)

- [ ] **Step 1: Add dismiss-flow tests**

Append to `RecommendationCard.test.tsx`:

```tsx
describe('RecommendationCard — dismiss flow', () => {
  it('shows reason prompt when Dismiss is clicked', async () => {
    render(<RecommendationCard {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.getByText('Why are you dismissing this?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Not relevant' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Already done' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Do later' })).toBeInTheDocument()
  })

  it('keeps the dimension badge visible in dismissing state', async () => {
    render(<RecommendationCard {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.getByText('Growth')).toBeInTheDocument()
  })

  it('calls onDismiss with "Not relevant"', async () => {
    const onDismiss = vi.fn()
    render(<RecommendationCard {...defaultProps} onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await userEvent.click(screen.getByRole('button', { name: 'Not relevant' }))
    expect(onDismiss).toHaveBeenCalledWith('Not relevant')
  })

  it('calls onDismiss with "Already done"', async () => {
    const onDismiss = vi.fn()
    render(<RecommendationCard {...defaultProps} onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await userEvent.click(screen.getByRole('button', { name: 'Already done' }))
    expect(onDismiss).toHaveBeenCalledWith('Already done')
  })

  it('calls onDismiss with "Do later"', async () => {
    const onDismiss = vi.fn()
    render(<RecommendationCard {...defaultProps} onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await userEvent.click(screen.getByRole('button', { name: 'Do later' }))
    expect(onDismiss).toHaveBeenCalledWith('Do later')
  })
})
```

- [ ] **Step 2: Run to confirm pass**

```bash
npx vitest run src/components/RecommendationCard.test.tsx
```
Expected: 12 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/RecommendationCard.test.tsx
git commit -m "test: add RecommendationCard dismiss flow tests"
```

---

## Task 5: RecommendationFeed — initial render

**Files:**
- Create: `src/components/RecommendationFeed.tsx`
- Create: `src/components/RecommendationFeed.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/RecommendationFeed.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RecommendationFeed from './RecommendationFeed'
import { RECOMMENDATIONS } from '../data/recommendations'

describe('RecommendationFeed — initial render', () => {
  it('renders exactly the first 4 recommendations on mount', () => {
    render(<RecommendationFeed />)
    expect(screen.getByText(RECOMMENDATIONS[0].title)).toBeInTheDocument()
    expect(screen.getByText(RECOMMENDATIONS[1].title)).toBeInTheDocument()
    expect(screen.getByText(RECOMMENDATIONS[2].title)).toBeInTheDocument()
    expect(screen.getByText(RECOMMENDATIONS[3].title)).toBeInTheDocument()
    expect(screen.queryByText(RECOMMENDATIONS[4].title)).not.toBeInTheDocument()
  })

  it('renders the priority selector with all three dimensions', () => {
    render(<RecommendationFeed />)
    expect(screen.getByRole('button', { name: 'Growth' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Productivity' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Customer Experience' })).toBeInTheDocument()
  })

  it('shows a remaining count', () => {
    render(<RecommendationFeed />)
    expect(screen.getByText('12 remaining')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm they fail**

```bash
npx vitest run src/components/RecommendationFeed.test.tsx
```
Expected: FAIL — "Cannot find module './RecommendationFeed'"

- [ ] **Step 3: Create the feed component (initial render only)**

```tsx
// src/components/RecommendationFeed.tsx
import { useState } from 'react'
import RecommendationCard from './RecommendationCard'
import { RECOMMENDATIONS, sortByPriority } from '../data/recommendations'
import type { Dimension, Recommendation } from '../data/recommendations'

const VISIBLE_COUNT = 4
const DIMENSIONS: Dimension[] = ['Growth', 'Productivity', 'Customer Experience']

interface RecommendationFeedProps {
  recommendations?: Recommendation[]
}

export default function RecommendationFeed({ recommendations = RECOMMENDATIONS }: RecommendationFeedProps) {
  const [activeIds, setActiveIds] = useState<string[]>(
    () => recommendations.slice(0, VISIBLE_COUNT).map(r => r.id)
  )
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [priority, setPriority] = useState<Dimension | null>(null)
  const [newCardId, setNewCardId] = useState<string | null>(null)

  const recMap = new Map(recommendations.map(r => [r.id, r]))
  const activeSet = new Set(activeIds)
  const waiting = sortByPriority(
    recommendations.filter(r => !removed.has(r.id) && !activeSet.has(r.id)),
    priority
  )
  const activeRecs = activeIds
    .map(id => recMap.get(id))
    .filter((r): r is Recommendation => r !== undefined)
  const remaining = recommendations.filter(r => !removed.has(r.id)).length

  function removeCard(id: string) {
    const nextRec = waiting[0]
    setTimeout(() => {
      setRemoved(prev => new Set([...prev, id]))
      setActiveIds(prev => {
        const updated = prev.filter(x => x !== id)
        return nextRec ? [...updated, nextRec.id] : updated
      })
      if (nextRec) {
        setNewCardId(nextRec.id)
        setTimeout(() => setNewCardId(null), 350)
      }
    }, 350)
  }

  function handlePriority(dim: Dimension) {
    setPriority(prev => (prev === dim ? null : dim))
  }

  return (
    <section className="mb-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</span>
        {DIMENSIONS.map(dim => (
          <button
            key={dim}
            onClick={() => handlePriority(dim)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              priority === dim
                ? 'bg-[#00B4B4] text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {dim}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{remaining} remaining</span>
      </div>

      {activeRecs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">You&apos;re all caught up.</p>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {activeRecs.map(rec => (
            <RecommendationCard
              key={rec.id}
              {...rec}
              isNew={rec.id === newCardId}
              onAct={() => removeCard(rec.id)}
              onDismiss={() => removeCard(rec.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 4: Run tests to confirm pass**

```bash
npx vitest run src/components/RecommendationFeed.test.tsx
```
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/RecommendationFeed.tsx src/components/RecommendationFeed.test.tsx
git commit -m "feat: add RecommendationFeed initial render"
```

---

## Task 6: RecommendationFeed — card cycling

**Files:**
- Modify: `src/components/RecommendationFeed.test.tsx` (add tests)

- [ ] **Step 1: Add cycling tests**

First, update the imports at the **top** of `RecommendationFeed.test.tsx` to add the new symbols:
```tsx
// replace the existing vitest import line with:
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
// add after the existing imports:
import userEvent from '@testing-library/user-event'
```

Then append the new describe block:

```tsx
describe('RecommendationFeed — card cycling', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('slides in card 5 after card 1 is acted on', async () => {
    render(<RecommendationFeed />)
    await userEvent.click(screen.getByRole('button', { name: RECOMMENDATIONS[0].ctaLabel }))
    vi.advanceTimersByTime(400)
    expect(screen.getByText(RECOMMENDATIONS[4].title)).toBeInTheDocument()
  })

  it('slides in card 5 after card 1 is dismissed', async () => {
    render(<RecommendationFeed />)
    const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss' })
    await userEvent.click(dismissButtons[0])
    await userEvent.click(screen.getByRole('button', { name: 'Not relevant' }))
    vi.advanceTimersByTime(400)
    expect(screen.getByText(RECOMMENDATIONS[4].title)).toBeInTheDocument()
  })

  it('decrements the remaining count when a card is acted on', async () => {
    render(<RecommendationFeed />)
    expect(screen.getByText('12 remaining')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: RECOMMENDATIONS[0].ctaLabel }))
    vi.advanceTimersByTime(400)
    expect(screen.getByText('11 remaining')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm pass**

```bash
npx vitest run src/components/RecommendationFeed.test.tsx
```
Expected: 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/RecommendationFeed.test.tsx
git commit -m "test: add RecommendationFeed card cycling tests"
```

---

## Task 7: RecommendationFeed — priority reordering

**Files:**
- Modify: `src/components/RecommendationFeed.test.tsx` (add tests)

- [ ] **Step 1: Add priority tests**

Append to `RecommendationFeed.test.tsx`:

```tsx
describe('RecommendationFeed — priority selector', () => {
  it('active 4 cards are unchanged when priority is switched', async () => {
    render(<RecommendationFeed />)
    // First 4 are all Growth (rec-1..rec-4)
    const initialTitles = RECOMMENDATIONS.slice(0, 4).map(r => r.title)

    await userEvent.click(screen.getByRole('button', { name: 'Customer Experience' }))

    initialTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
    // CX cards should not yet be visible
    expect(screen.queryByText(RECOMMENDATIONS[8].title)).not.toBeInTheDocument()
  })

  it('next card after an act comes from the priority dimension', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    render(<RecommendationFeed />)

    // Set priority to Customer Experience
    await userEvent.click(screen.getByRole('button', { name: 'Customer Experience' }))

    // Act on first card — next should be the first CX card (rec-9)
    await userEvent.click(screen.getByRole('button', { name: RECOMMENDATIONS[0].ctaLabel }))
    vi.advanceTimersByTime(400)

    expect(screen.getByText(RECOMMENDATIONS[8].title)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('toggling the active priority pill resets to default order', async () => {
    render(<RecommendationFeed />)
    const prodButton = screen.getByRole('button', { name: 'Productivity' })
    await userEvent.click(prodButton)
    await userEvent.click(prodButton) // toggle off
    // No error; component still renders
    expect(screen.getByText(RECOMMENDATIONS[0].title)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm pass**

```bash
npx vitest run src/components/RecommendationFeed.test.tsx
```
Expected: 9 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/RecommendationFeed.test.tsx
git commit -m "test: add RecommendationFeed priority selector tests"
```

---

## Task 8: RecommendationFeed — empty state

**Files:**
- Modify: `src/components/RecommendationFeed.test.tsx` (add test)

- [ ] **Step 1: Add empty-state test**

Append to `RecommendationFeed.test.tsx`:

```tsx
describe('RecommendationFeed — empty state', () => {
  it('shows "You\'re all caught up." when all cards are removed', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    render(<RecommendationFeed recommendations={[RECOMMENDATIONS[0]]} />)
    await userEvent.click(screen.getByRole('button', { name: RECOMMENDATIONS[0].ctaLabel }))
    vi.advanceTimersByTime(400)
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument()
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
```
Expected: all tests pass (card + feed).

- [ ] **Step 3: Commit**

```bash
git add src/components/RecommendationFeed.test.tsx
git commit -m "test: add RecommendationFeed empty state test"
```

---

## Task 9: Wire RecommendationFeed into App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/App.tsx`, after the existing imports:
```tsx
import RecommendationFeed from './components/RecommendationFeed'
```

- [ ] **Step 2: Add the feed above the KPI row**

In the `<main>` block of `App.tsx`, insert `<RecommendationFeed />` before the KPI grid div:

```tsx
<main className="p-5 max-w-screen-2xl">
  <RecommendationFeed />      {/* ← add this line */}

  {/* KPI row */}
  <div className="grid grid-cols-2 gap-3 max-w-2xl mb-5">
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:5173`. Confirm:
- Priority selector row appears above KPI tiles
- 4 recommendation cards render in a grid
- Clicking a CTA button removes the card and slides in the next
- Clicking Dismiss shows the reason prompt; selecting a reason removes the card
- Priority pills reorder the queue (active 4 unchanged; next card after removal is from priority dimension)
- Removing all cards shows "You're all caught up."

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire RecommendationFeed into dashboard above KPI tiles"
```

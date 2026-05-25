import { useState } from 'react'
import RecommendationCard from './RecommendationCard'
import { RECOMMENDATIONS, sortByPriority } from '../data/recommendations'
import type { Dimension, DismissReason, Recommendation } from '../data/recommendations'

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

  function handleDismiss(id: string) {
    return (_reason: DismissReason) => removeCard(id)
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
              onDismiss={handleDismiss(rec.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

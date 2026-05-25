import { useState, useEffect } from 'react'
import type { Dimension, DismissReason } from '../data/recommendations'
import { DISMISS_REASONS } from '../data/recommendations'

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

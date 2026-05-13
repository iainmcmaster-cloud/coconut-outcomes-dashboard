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

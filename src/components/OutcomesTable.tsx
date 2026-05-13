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
      dir: prev.colIdx === colIdx && prev.dir === 'asc' ? 'desc' : 'asc',
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
              sortedRows.map((row) => {
                const total = sumCounts(row.c)
                return (
                  <tr key={row.name} className="border-t border-gray-50 hover:bg-blue-50">
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

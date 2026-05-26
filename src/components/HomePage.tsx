import { useState } from 'react'
import RecommendationFeed from './RecommendationFeed'

type Tab = 'Operations' | 'Staff Performance' | 'Marketing and Revenue'
type Period = 'Month to Date' | 'Last 30 Days' | 'Last 90 Days'

const TABS: Tab[] = ['Operations', 'Staff Performance', 'Marketing and Revenue']
const PERIODS: Period[] = ['Month to Date', 'Last 30 Days', 'Last 90 Days']

// Mock heatmap data — busiest hours
const HOURS = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HEATMAP: number[][] = [
  [0.9, 0.7, 0.5, 0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.4, 0.2],
  [0.6, 0.8, 0.4, 0.5, 0.3, 0.9, 0.4, 0.6, 0.5, 0.7, 0.3],
  [0.5, 0.6, 0.9, 0.3, 0.7, 0.5, 0.4, 0.8, 0.3, 0.5, 0.4],
  [0.4, 0.5, 0.6, 0.8, 0.4, 0.6, 0.7, 0.4, 0.9, 0.3, 0.5],
  [0.7, 0.4, 0.5, 0.6, 0.8, 0.4, 0.5, 0.7, 0.4, 0.6, 0.3],
  [0.3, 0.5, 0.4, 0.3, 0.5, 0.4, 0.3, 0.4, 0.3, 0.2, 0.1],
  [0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.2, 0.2, 0.1, 0.1],
]

function heatColor(v: number) {
  if (v > 0.8) return '#1e3a5f'
  if (v > 0.6) return '#c0392b'
  if (v > 0.4) return '#e67e22'
  if (v > 0.2) return '#f4d35e'
  return '#d4eac8'
}

const DURATION_DATA = [
  { service: 'Mortgages', deviation: '+19 min' },
  { service: 'Personal Bank Account', deviation: '−13 min' },
  { service: 'RRSP Borrowing under $10k', deviation: '+10 min' },
  { service: 'Deceased Member Services', deviation: '+10 min' },
  { service: 'Microloans', deviation: '+10 min' },
  { service: 'Personal Banking (Newcom...', deviation: '+6 min' },
  { service: 'Savings Advice', deviation: '−6 min' },
  { service: 'Business Mortgages', deviation: '+5 min' },
]

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('Operations')
  const [period, setPeriod] = useState<Period>('Month to Date')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-5 h-14 flex items-center gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-600 rounded-md flex items-center justify-center text-white text-xs font-bold">CS</div>
          <span className="text-sm font-semibold text-gray-900">Coconut Software</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-500">First National Bank</span>
          <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">IM</div>
        </div>
      </nav>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-5 flex items-center justify-between">
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-teal-600 text-teal-700 bg-teal-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as Period)}
          className="text-sm text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 bg-white"
        >
          {PERIODS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <main className="p-5 max-w-screen-xl mx-auto">
        {/* Recommendation feed */}
        <RecommendationFeed />

        {/* Charts row */}
        <div className="grid grid-cols-[1fr_360px] gap-4 mb-4">
          {/* Heatmap card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">What are my busiest times?</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-10" />
                    {HOURS.map(h => (
                      <th key={h} className="text-[10px] text-gray-400 font-normal pb-2 text-center w-10">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, di) => (
                    <tr key={day}>
                      <td className="text-[10px] text-gray-500 pr-2 text-right">{day}</td>
                      {HOURS.map((_, hi) => (
                        <td key={hi} className="p-0.5">
                          <div
                            className="w-8 h-6 rounded-sm"
                            style={{ backgroundColor: heatColor(HEATMAP[di][hi]) }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-3">
              <button className="text-xs text-gray-500 border border-gray-200 rounded px-3 py-1 hover:bg-gray-50">See More</button>
            </div>
          </div>

          {/* Duration deviations */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Are appointment durations configured correctly?</h2>
            <div className="flex justify-between text-xs text-gray-400 font-medium mb-2 px-1">
              <span>Service</span>
              <span>Deviation</span>
            </div>
            {DURATION_DATA.map((row, i) => (
              <div key={row.service} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-600">{i + 1}.&nbsp; {row.service}</span>
                <span className={`text-xs font-semibold ${row.deviation.startsWith('+') ? 'text-red-600' : 'text-emerald-600'}`}>
                  {row.deviation}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Do customers walk-in or make appointments?</h2>
            <div className="flex items-end gap-6 mt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">43%</div>
                <div className="text-xs text-gray-500 mt-1">Walk-ins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">57%</div>
                <div className="text-xs text-gray-500 mt-1">Appointments</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Are our lobby wait times too long?</h2>
            <div className="flex items-end gap-6 mt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">18 min</div>
                <div className="text-xs text-gray-500 mt-1">Avg wait time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">+4 min</div>
                <div className="text-xs text-gray-500 mt-1">vs benchmark</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

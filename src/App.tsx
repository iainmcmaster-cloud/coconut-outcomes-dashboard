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

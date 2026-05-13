type Filters = {
  staffGroup: string
  location: string
  service: string
}

type Props = {
  filters: Filters
  locationOptions: string[]
  onChange: (filters: Filters) => void
}

const STAFF_GROUPS = ['Senior Financial Advisor', 'Advisor', 'Call Centre']
const SERVICES = ['General Banking', 'Mortgage', 'Investments', 'Credit Cards', 'Loans', 'Open Bank Account']

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-700">
      <span className="text-gray-400 font-medium uppercase text-[10px] tracking-wide">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-xs text-gray-800 font-medium cursor-pointer"
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function FilterBar({ filters, locationOptions, onChange }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2 flex-wrap sticky top-14 z-40">
      {/* Display-only filters */}
      <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-700">
        <span className="text-gray-400 font-medium uppercase text-[10px] tracking-wide">Customer</span>
        <span className="font-medium">First National Bank</span>
        <span className="text-gray-400">▾</span>
      </div>
      <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-700">
        <span className="text-gray-400 font-medium uppercase text-[10px] tracking-wide">Date</span>
        <span className="font-medium">Nov 1 – Nov 30, 2024</span>
        <span className="text-gray-400">▾</span>
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Active filters */}
      <FilterSelect
        label="Staff Group"
        value={filters.staffGroup}
        options={STAFF_GROUPS}
        onChange={v => onChange({ ...filters, staffGroup: v })}
      />
      <FilterSelect
        label="Location"
        value={filters.location}
        options={locationOptions}
        onChange={v => onChange({ ...filters, location: v })}
      />
      <FilterSelect
        label="Service"
        value={filters.service}
        options={SERVICES}
        onChange={v => onChange({ ...filters, service: v })}
      />

      <div className="ml-auto bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5 text-xs text-blue-700 font-medium whitespace-nowrap">
        Comparing to: Oct 1 – Oct 31, 2024
      </div>
    </div>
  )
}

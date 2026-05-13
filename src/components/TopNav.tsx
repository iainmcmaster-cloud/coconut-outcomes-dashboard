type Props = {
  customerName: string
}

export default function TopNav({ customerName }: Props) {
  return (
    <nav className="bg-white border-b border-gray-200 px-5 h-14 flex items-center gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
          CS
        </div>
        <span className="text-sm font-semibold text-gray-900">Coconut Software</span>
      </div>
      <span className="text-gray-300 text-lg">/</span>
      <span className="text-sm text-gray-500">Meeting Outcomes</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-gray-500">{customerName}</span>
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          IM
        </div>
      </div>
    </nav>
  )
}

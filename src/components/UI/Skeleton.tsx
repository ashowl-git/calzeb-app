// Skeleton UI 컴포넌트 - 로딩 상태 표시
// Design: LESS IS MORE Minimalism

export function SkeletonCard() {
  return (
    <div className="border-2 border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-100 w-full mb-2"></div>
      <div className="h-4 bg-gray-100 w-2/3 mb-4"></div>
      <div className="flex gap-2 pt-4 border-t-2 border-gray-200">
        <div className="h-10 bg-gray-200 flex-1"></div>
        <div className="h-10 bg-gray-100 w-20"></div>
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="border-2 border-gray-200">
      {/* Header */}
      <div className="border-b-2 border-gray-200 bg-gray-50 p-4 animate-pulse">
        <div className="flex gap-4">
          <div className="h-4 bg-gray-300 w-1/4"></div>
          <div className="h-4 bg-gray-300 w-1/4"></div>
          <div className="h-4 bg-gray-300 w-1/4"></div>
          <div className="h-4 bg-gray-300 w-1/4"></div>
        </div>
      </div>
      {/* Rows */}
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="border-b border-gray-100 p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 w-1/4"></div>
            <div className="h-4 bg-gray-200 w-1/4"></div>
            <div className="h-4 bg-gray-200 w-1/4"></div>
            <div className="h-4 bg-gray-200 w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonProjectGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonProjectDetail() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="border-2 border-gray-200 p-8 bg-gray-50">
        <div className="h-8 bg-gray-300 w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border-2 border-gray-200 bg-white p-4">
              <div className="h-3 bg-gray-200 w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-300 w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
      {/* Table */}
      <SkeletonTable />
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number, className?: string }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        ></div>
      ))}
    </div>
  )
}

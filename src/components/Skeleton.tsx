"use client"

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-variant rounded-lg ${className}`} />
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden ${className}`}>
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-outline-variant/10">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={`h-4 ${i === 0 ? "w-16" : i === cols - 1 ? "w-20 ml-auto" : "w-full"}`} />
        </td>
      ))}
    </tr>
  )
}

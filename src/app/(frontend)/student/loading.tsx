import React from 'react'

export default function StudentLoading() {
  return (
    <div className="py-12 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="h-4 w-20 rounded bg-[#e2e8f0]" />
      <div className="mt-4 h-10 w-64 rounded bg-[#cbd5e1]" />
      <div className="mt-3 h-5 w-96 rounded bg-[#e2e8f0]" />

      {/* Grid Cards Skeleton */}
      <div className="mt-9 grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-[12rem] flex-col rounded-md border border-black/5 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-[#e2e8f0]" />
              <div className="h-4 w-24 rounded bg-[#e2e8f0]" />
            </div>
            <div className="mt-6 h-8 w-48 rounded bg-[#cbd5e1]" />
            <div className="mt-3 h-6 w-36 rounded bg-[#e2e8f0]" />
            <div className="mt-auto h-4 w-44 rounded bg-[#e2e8f0]" />
          </div>
        ))}
      </div>
    </div>
  )
}

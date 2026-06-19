import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  return (
    <span className={props.className}>
      <span className="flex items-center gap-3">
        <span className="relative grid size-11 place-items-center overflow-hidden rounded-full bg-[#034EA2] text-[11px] font-black text-white">
          IEM<span className="absolute bottom-0 h-2 w-full bg-[#ed1c24]" />
        </span>
        <strong className="text-lg tracking-tight text-current">IEM<span className="text-[#ed1c24]">.lk</span></strong>
      </span>
    </span>
  )
}

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
        <span className="grid size-10 place-items-center rounded-full border-[3px] border-current text-[11px] font-black tracking-[-0.08em]">IE</span>
        <strong className="text-lg tracking-tight text-current">IEM<span className="text-gold-dark">lk</span></strong>
      </span>
    </span>
  )
}

import Link from 'next/link'

export function AuthBrand() {
  return (
    <Link className="inline-flex items-center gap-3 text-[#34343b]" href="/">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-full border-[3px] border-current text-[11px] font-black tracking-[-0.08em]"
      >
        IE
      </span>
      <span className="text-xl font-bold tracking-tight">
        IESM<span className="text-[#ed1c24]"> English</span>
      </span>
    </Link>
  )
}

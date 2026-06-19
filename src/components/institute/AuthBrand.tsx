import Link from 'next/link'

export function AuthBrand() {
  return (
    <Link className="inline-flex items-center gap-3 text-[#34343b]" href="/">
      <span aria-hidden className="grid size-8 place-items-center rounded-full bg-[#034EA2] text-[10px] font-black text-white">
        IEM
      </span>
      <span className="text-xl font-bold tracking-tight">
        IEM<span className="text-[#ed1c24]">.lk</span>
      </span>
    </Link>
  )
}

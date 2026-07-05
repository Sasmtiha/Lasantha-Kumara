import Link from 'next/link'
import { Logo } from '@/components/Logo/Logo'

export function AuthBrand() {
  return (
    <Link className="inline-flex items-center text-[#34343b]" href="/">
      <Logo variant="light" />
    </Link>
  )
}

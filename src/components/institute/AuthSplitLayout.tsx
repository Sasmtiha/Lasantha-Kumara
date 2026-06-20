import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { AuthBrand } from './AuthBrand'

type Props = {
  children: ReactNode
  description: string
  image?: string
  title: string
}

export function AuthSplitLayout({ children, description, image, title }: Props) {
  return (
    <main className="auth-page relative min-h-svh bg-white p-4 sm:p-6 lg:p-8">
      <Link
        aria-label="Close and return to website"
        className="absolute right-6 top-6 z-20 grid size-11 place-items-center rounded-full border border-[#d6d6db] bg-white text-[#34343b] shadow-[0_8px_24px_rgba(15,23,42,.08)] transition duration-300 hover:-translate-y-px hover:border-[#034EA2] hover:bg-[#034EA2] hover:text-white sm:right-8 sm:top-8"
        href="/"
      >
        <X className="size-5" />
      </Link>
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-[118rem] overflow-hidden lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(34rem,.92fr)] lg:gap-8">
        <div className="relative hidden min-h-[calc(100svh-4rem)] overflow-hidden rounded-[1.35rem] bg-[#eeeeec] lg:block">
          {image && (
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 0vw"
              src={image}
            />
          )}
        </div>

        <section className="flex min-w-0 items-center justify-center px-2 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[38rem]">
            <AuthBrand />
            <div className="mt-14">
              <h1 className="text-3xl font-semibold tracking-tight text-[#34343b]">{title}</h1>
              <p className="mt-2 leading-7 text-[#73737d]">{description}</p>
            </div>
            <div className="mt-9">{children}</div>
          </div>
        </section>
      </div>
    </main>
  )
}


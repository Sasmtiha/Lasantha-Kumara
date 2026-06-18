import type { ReactNode } from 'react'

import { AuthBrand } from './AuthBrand'

type Props = {
  children: ReactNode
  description: string
  title: string
}

export function AuthSplitLayout({ children, description, title }: Props) {
  return (
    <main className="auth-page min-h-svh bg-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-[118rem] overflow-hidden lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(34rem,.92fr)] lg:gap-8">
        <div
          aria-label="Image placeholder"
          className="hidden min-h-[calc(100svh-4rem)] rounded-[1.35rem] bg-[#eeeeec] lg:block"
          role="img"
        />

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

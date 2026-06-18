import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { getCachedGlobal as getGlobal } from '@/utilities/getGlobals'

export async function Footer() {
  const [footerData, settings] = await Promise.all([
    getCachedGlobal('footer', 1)(),
    getGlobal('site-settings', 1)(),
  ])

  const navItems = footerData?.navItems || []

  return (
    <footer className="site-footer relative mt-auto overflow-hidden bg-[#0f172a] text-white">
      <span aria-hidden className="absolute -bottom-16 left-0 text-[16vw] font-black leading-none text-white/[.025]">IEMLK</span>
      <div className="premium-container relative grid gap-12 py-20 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-1">
          <Link className="flex items-center" href="/"><Logo /></Link>
          {footerData.missionText ? <p className="mt-6 max-w-sm leading-7 text-white/55">{footerData.missionText}</p> : null}
          <Link className="mt-6 inline-flex text-sm font-bold text-[#ffc107]" href="/login">Student Portal →</Link>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[.16em] text-[#ffc107]">Quick Links</h2>
          <nav className="mt-5 flex flex-col gap-3">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white/65 hover:text-white" key={i} {...link} />
            })}
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[.16em] text-[#ffc107]">Classes</h2>
          <div className="mt-5 flex flex-col gap-3 text-white/65">
            <Link href="/classes/spoken-english">Spoken English</Link>
            <Link href="/classes/ol-english">O/L English</Link>
            <Link href="/classes/al-english">A/L English</Link>
            <Link href="/classes/business-english">Business English</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[.16em] text-[#ffc107]">Contact</h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-white/65">
            <p>{settings.phone}</p><p>{settings.email}</p><p>{settings.addressEn}</p>
          </div>
        </div>
      </div>
      <div className="premium-container relative border-t border-white/10 py-6 text-sm text-white/40">
        {footerData.copyrightText || `© ${new Date().getFullYear()} IEMlk. All rights reserved.`}
      </div>
    </footer>
  )
}

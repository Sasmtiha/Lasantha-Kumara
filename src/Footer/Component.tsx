import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { Logo } from '@/components/Logo/Logo'
import { getCachedGlobal as getGlobal } from '@/utilities/getGlobals'
import { Facebook, MessageCircle, Youtube } from 'lucide-react'

export async function Footer() {
  const [footerData, settings] = await Promise.all([
    getCachedGlobal('footer', 1)(),
    getGlobal('site-settings', 1)(),
  ])

  const navItems = footerData?.navItems || []
  const sectionLinks = navItems.map(({ link }) => {
    const sectionByLabel: Record<string, string> = {
      classes: '/#classes',
      contact: '/#contact',
      schedule: '/#schedule',
    }

    return {
      href: sectionByLabel[link.label.toLowerCase()] || link.url || '/',
      label: link.label,
      newTab: link.newTab,
    }
  })

  return (
    <footer className="site-footer relative mt-auto overflow-hidden bg-[#090a0e] text-white">
      <span aria-hidden className="absolute -bottom-16 left-0 text-[16vw] font-semibold leading-none text-white/[.025]">IEM.lk</span>
      <div className="premium-container relative grid gap-12 py-20 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-1">
          <Link className="flex items-center" href="/"><Logo /></Link>
          {footerData.missionText ? <p className="mt-6 max-w-sm leading-7 text-white/55">{footerData.missionText}</p> : null}
          <Link className="mt-6 inline-flex text-sm font-medium text-white transition hover:text-[#75aff0]" href="/login">Student Portal →</Link>
        </div>
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[.14em] text-[#75aff0]">Quick Links</h2>
          <nav className="mt-5 flex flex-col gap-3">
            {sectionLinks.map((link) => (
              <Link
                className="text-white/65 transition hover:translate-x-1 hover:text-white"
                href={link.href}
                key={`${link.label}-${link.href}`}
                target={link.newTab ? '_blank' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[.14em] text-[#75aff0]">Classes</h2>
          <div className="mt-5 flex flex-col gap-3 text-white/65">
            {[6, 7, 8, 9, 10, 11].map((grade) => (
              <Link className="transition hover:translate-x-1 hover:text-white" href="/#classes" key={grade}>Grade {grade} English</Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[.14em] text-[#75aff0]">Contact</h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-white/65">
            <p>{settings.phone}</p><p>{settings.secondaryPhone}</p><p>{settings.email}</p><p>{settings.addressEn}</p>
          </div>
          <div className="mt-5 flex gap-3">
            {settings.facebookUrl ? <a aria-label="IEM.lk on Facebook" className="grid size-10 place-items-center rounded-md border border-white/15 text-white/70 hover:border-[#034EA2] hover:text-[#034EA2]" href={settings.facebookUrl} rel="noreferrer" target="_blank"><Facebook className="size-4" /></a> : null}
            {settings.youtubeUrl ? <a aria-label="IEM.lk on YouTube" className="grid size-10 place-items-center rounded-md border border-white/15 text-white/70 hover:border-[#034EA2] hover:text-[#034EA2]" href={settings.youtubeUrl} rel="noreferrer" target="_blank"><Youtube className="size-4" /></a> : null}
          </div>
        </div>
      </div>
      <div className="premium-container relative border-t border-white/10 py-6 text-sm text-white/40">
        {footerData.copyrightText || `© ${new Date().getFullYear()} IEM.lk. All rights reserved.`}
      </div>
      {settings.whatsappNumber ? (
        <a
          aria-label="Contact IEM.lk on WhatsApp"
          className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-md border border-white/20 bg-[#0a0b0f] text-white shadow-[0_12px_30px_rgba(10,11,15,.25)] transition hover:-translate-y-1 hover:border-[#034EA2] hover:bg-[#034EA2]"
          href={settings.whatsappNumber.startsWith('http') ? settings.whatsappNumber : `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircle className="size-6" />
        </a>
      ) : null}
    </footer>
  )
}

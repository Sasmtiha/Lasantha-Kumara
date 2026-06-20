import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Noto_Sans_Sinhala, Source_Sans_3, Space_Grotesk } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { SmoothAnchorScroll } from '@/components/institute/SmoothAnchorScroll'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cookies, draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

const sourceSans = Source_Sans_3({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-source-sans',
  weight: ['400', '500', '600', '700'],
})

const spaceGrotesk = Space_Grotesk({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
})

const notoSansSinhala = Noto_Sans_Sinhala({
  display: 'swap',
  subsets: ['sinhala'],
  variable: '--font-noto-sinhala',
  weight: ['400', '500', '600', '700'],
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const locale = (await cookies()).get('site-locale')?.value === 'si' ? 'si' : 'en'

  return (
    <html
      className={cn(sourceSans.variable, spaceGrotesk.variable, notoSansSinhala.variable)}
      data-theme="light"
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <SmoothAnchorScroll />
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@lasanthaenglish',
  },
}

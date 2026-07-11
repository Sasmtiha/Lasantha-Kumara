import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const allowedHostnames = new Set<string>(['localhost', '*.vercel.app'])

if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  allowedHostnames.add(process.env.VERCEL_PROJECT_PRODUCTION_URL)
}
if (process.env.VERCEL_URL) {
  allowedHostnames.add(process.env.VERCEL_URL)
}
if (process.env.NEXT_PUBLIC_SERVER_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SERVER_URL)
    allowedHostnames.add(url.hostname)
  } catch {
    allowedHostnames.add(process.env.NEXT_PUBLIC_SERVER_URL.replace(/^https?:\/\//, ''))
  }
}

const supabaseImageRemotePattern = process.env.SUPABASE_PROJECT_REF
  ? [
      {
        hostname: `${process.env.SUPABASE_PROJECT_REF}.supabase.co`,
        pathname: `/storage/v1/object/public/${process.env.SUPABASE_STORAGE_BUCKET || '**'}/**`,
        protocol: 'https' as const,
      },
    ]
  : []

const nextConfig: NextConfig = {
  // Payload serves uploads through server routes. Include existing local uploads
  // in Vercel's serverless function bundle so those routes can read the files.
  outputFileTracingIncludes: {
    '/*': ['./public/media/**/*', './public/gallery/**/*'],
    '/api/resource-files/file/*': ['./protected/resource-files/**/*'],
    '/api/payment-slips/file/*': ['./protected/payment-slips/**/*'],
  },
  // Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/api/gallery/file/**',
      },
      {
        pathname: '/hero-master-english-iem.png',
      },
      {
        pathname: '/login.png',
      },
      {
        pathname: '/register.png',
      },
    ],
    qualities: [100],
    remotePatterns: [
      ...Array.from(allowedHostnames).map((host) => {
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
        return {
          hostname: host,
          protocol: (isLocal ? 'http' : 'https') as 'http' | 'https',
        }
      }),
      ...supabaseImageRemotePattern,
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

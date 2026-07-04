import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest, type CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Classes } from './collections/Classes'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Enrollments } from './collections/Enrollments'
import { Notices } from './collections/Notices'
import { Resources } from './collections/Resources'
import { Schedules } from './collections/Schedules'
import { Students } from './collections/Students'
import { Exams } from './collections/Exams'
import { StudentMarks } from './collections/StudentMarks'
import { Teachers } from './collections/Teachers'
import { Testimonials } from './collections/Testimonials'
import { Gallery } from './collections/Gallery'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const withLMSListFilters = (collection: CollectionConfig): CollectionConfig => ({
  ...collection,
  admin: {
    ...collection.admin,
    components: {
      ...collection.admin?.components,
      beforeListTable: [
        '@/components/LMSListFilters',
        ...(collection.admin?.components?.beforeListTable || []),
      ],
    },
  },
})

export default buildConfig({
  admin: {
    components: {
      actions: ['@/components/AdminThemeToggle', '@/components/AdminHeaderSearch'],
      beforeLogin: ['@/components/AdminThemeToggle', '@/components/BeforeLogin'],
      graphics: {
        Icon: '@/components/AdminBrand#AdminIcon',
        Logo: '@/components/AdminBrand#AdminLogo',
      },
      Nav: '@/components/LMSAdminNav',
      views: {
        dashboard: {
          Component: '@/components/LMSDashboard',
          meta: {
            title: 'LMS Dashboard',
          },
        },
      },
    },
    meta: {
      icons: {
        apple: '/favicon.ico',
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
      },
      titleSuffix: ' · IEM.lk LMS',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [
    Pages,
    Classes,
    Schedules,
    Testimonials,
    Gallery,
    Teachers,
    Students,
    Enrollments,
    Exams,
    StudentMarks,
    Notices,
    Resources,
    ContactSubmissions,
    Posts,
    Media,
    Categories,
    Users,
  ].map(withLMSListFilters),
  cors: [getServerSideURL()].filter(Boolean),
  globals: [SiteSettings, Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})

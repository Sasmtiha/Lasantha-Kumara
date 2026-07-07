import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { s3Storage } from '@payloadcms/storage-s3'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { Plugin } from 'payload'

import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'

const supabaseStorageEnabled = Boolean(
  process.env.SUPABASE_PROJECT_REF &&
  process.env.SUPABASE_STORAGE_BUCKET &&
  process.env.SUPABASE_STORAGE_ACCESS_KEY_ID &&
  process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY,
)

const getSupabaseMediaUrl = ({ filename, prefix }: { filename: string; prefix?: string }) => {
  const baseUrl = `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public`
  const bucket = process.env.SUPABASE_STORAGE_BUCKET
  const path = [prefix, filename].filter(Boolean).join('/')
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${baseUrl}/${bucket}/${encodedPath}`
}

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | IEM` : 'IEM'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

type PluginConfig = Parameters<Plugin>[0]

const cloneConfigForRedirectsPlugin = (incomingConfig: PluginConfig): PluginConfig => ({
  ...incomingConfig,
  i18n: incomingConfig.i18n
    ? {
        ...incomingConfig.i18n,
        supportedLanguages: incomingConfig.i18n.supportedLanguages
          ? { ...incomingConfig.i18n.supportedLanguages }
          : incomingConfig.i18n.supportedLanguages,
        translations: incomingConfig.i18n.translations
          ? { ...incomingConfig.i18n.translations }
          : incomingConfig.i18n.translations,
      }
    : incomingConfig.i18n,
})

const redirects = redirectsPlugin({
  collections: ['pages', 'posts'],
  overrides: {
    admin: {
      group: 'Website',
      hidden: true,
    },
    // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
    fields: ({ defaultFields }) => {
      return defaultFields.map((field) => {
        if ('name' in field && field.name === 'from') {
          return {
            ...field,
            admin: {
              description: 'You will need to rebuild the website when changing this field.',
            },
          }
        }

        return field
      })
    },
    hooks: {
      afterChange: [revalidateRedirects],
    },
  },
})

const redirectsWithMutableI18n: Plugin = (incomingConfig) => {
  return redirects(cloneConfigForRedirectsPlugin(incomingConfig))
}

export const plugins: Plugin[] = [
  s3Storage({
    enabled: supabaseStorageEnabled,
    bucket: process.env.SUPABASE_STORAGE_BUCKET || '',
    config: {
      credentials: {
        accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY || '',
      },
      endpoint: process.env.SUPABASE_PROJECT_REF
        ? `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/storage/v1/s3`
        : undefined,
      forcePathStyle: true,
      region: process.env.SUPABASE_STORAGE_REGION || 'us-east-1',
    },
    collections: {
      gallery: {
        generateFileURL: getSupabaseMediaUrl,
        prefix: 'gallery',
      },
      media: {
        generateFileURL: getSupabaseMediaUrl,
      },
      'payment-slips': {
        generateFileURL: getSupabaseMediaUrl,
      },
    },
  }),
  redirectsWithMutableI18n,
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      admin: {
        group: 'Website',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }

          return field
        })
      },
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Website',
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: {
        group: 'Admin',
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]

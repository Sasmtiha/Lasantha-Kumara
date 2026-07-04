declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      SUPABASE_PROJECT_REF: string
      SUPABASE_STORAGE_BUCKET: string
      SUPABASE_STORAGE_REGION: string
      SUPABASE_STORAGE_ACCESS_KEY_ID: string
      SUPABASE_STORAGE_SECRET_ACCESS_KEY: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

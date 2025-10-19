import { type Config } from 'drizzle-kit'

import { env } from '~/env'

export default {
  schema: '../lib/src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ['app_*'],
} satisfies Config

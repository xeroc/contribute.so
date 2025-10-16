import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { type DefaultSession, type NextAuthOptions } from 'next-auth'
import { eq } from 'drizzle-orm'
import GithubProvider from 'next-auth/providers/github'
import TwitterProvider from 'next-auth/providers/twitter'

import { env } from '~/env'
import { db } from '~/server/db'
import { accounts, sessions, users, verificationTokens } from '~/server/db/schema'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      username: string
      provider: string
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user']
  }

  interface Account {
    username?: string
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      // Get the account to fetch username
      const [account] = await db
        .select({ username: accounts.username, provider: accounts.provider })
        .from(accounts)
        .where(eq(accounts.userId, user.id))
        .limit(1)

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          username: account!.username,
          provider: account!.provider,
        },
      }
    },
    signIn: async ({ account, profile }) => {
      if (account?.provider === 'github' && profile && 'login' in profile) {
        // Store the GitHub username in the account
        account.username = profile.login as string
      }
      return true
    },
  },

  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: '2.0', // Use OAuth 2.0
    }),
    // Add more providers as needed
  ],
}

'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '~/server/auth'
import { db } from '@contribute-so/lib/db'
import { accounts } from '@contribute-so/lib/db/schema'
import { eq } from 'drizzle-orm'
import { fetchUserRepositories } from '~/utils/github'
import { createUserSetup, getUserSetups } from '~/utils/setup'

export async function getUserRepositories() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  // Get GitHub access token
  const account = await db.select().from(accounts).where(eq(accounts.userId, session.user.id)).limit(1)

  if (!account[0]?.access_token) {
    throw new Error('No GitHub access token found')
  }

  return await fetchUserRepositories(account[0].access_token)
}

export async function saveUserSetup(repository: string, walletPublicKey: string, provider = 'github') {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  return await createUserSetup({
    userId: session.user.id,
    provider,
    repository,
    walletPublicKey,
  })
}

export async function getUserSetupsAction() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  return await getUserSetups(session.user.id)
}

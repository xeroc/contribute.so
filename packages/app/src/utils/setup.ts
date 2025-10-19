import { eq } from 'drizzle-orm'
import { db } from '@contribute-so/lib/db'
import { userSetups } from '@contribute-so/lib/db/schema'

export interface CreateUserSetupData {
  userId: string
  provider: string
  repository: string
  walletPublicKey: string
}

export async function createUserSetup(data: CreateUserSetupData) {
  return await db.insert(userSetups).values(data).returning()
}

export async function getUserSetups(userId: string) {
  return await db.select().from(userSetups).where(eq(userSetups.userId, userId))
}

export async function getUserSetupById(id: string) {
  return await db.select().from(userSetups).where(eq(userSetups.id, id)).limit(1)
}

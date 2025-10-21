import { notFound } from 'next/navigation'
import { db } from '@contribute-so/lib/db'
import { userSetups, users } from '@contribute-so/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { Layout } from '~/app/_components/layout'
import Link from 'next/link'
import SubscriptionInfo, { type SetupData } from '~/app/_components/SubscriptionInfo'

interface PageProps {
  params: Promise<{
    provider: string
    username: string
    repository: string[]
  }>
}

export default async function RepositorySetupPage({ params }: PageProps) {
  const { provider, username, repository: repoArray } = await params

  let fullRepository: string
  if (!repoArray) {
    // Twitter: repository is just the username
    fullRepository = username
  } else if (repoArray.length === 1) {
    // GitHub: repository is username/repo
    fullRepository = `${username}/${repoArray[0]}`
  } else {
    notFound()
  }

  // Query for the setup

  const setupQuery = db
    .select({
      id: userSetups.id,
      provider: userSetups.provider,
      repository: userSetups.repository,
      walletPublicKey: userSetups.walletPublicKey,
      createdAt: userSetups.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(userSetups)
    .leftJoin(users, eq(userSetups.userId, users.id))
    .where(and(eq(userSetups.provider, provider), eq(userSetups.repository, fullRepository)))
    .limit(1)

  const setup = (await setupQuery) as SetupData[]

  if (!setup[0]) {
    notFound()
  }

  const setupData: SetupData = { ...setup[0], fullRepository }

  return (
    <Layout>
      <div className="flex h-full flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 max-w-2xl">
          <SubscriptionInfo setupData={setupData} />
          <div className="text-center text-default-600">
            <p>
              This repository is configured for automated monthly donations via{' '}
              <Link className="underline" href="https://tributary.so">
                Tributary protocol
              </Link>
              .
            </p>
            <p>Donations are processed transparently on the Solana blockchain.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

import { notFound } from 'next/navigation'
import { db } from '~/server/db'
import { userSetups, users } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { Layout } from '~/app/_components/layout'
import { DonationButton } from '~/app/_components/donation-button'

interface PageProps {
  params: Promise<{
    provider: string
    username: string
    repository: string
  }>
}

interface SetupData {
  id: string
  provider: string
  repository: string
  walletPublicKey: string
  createdAt: Date | null
  userName: string | null
  userEmail: string | null
}

export default async function RepositorySetupPage({ params }: PageProps) {
  const { provider, username, repository } = await params
  const fullRepository = `${username}/${repository}`

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

  const setupData = setup[0]

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center pt-16">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 max-w-2xl">
          <h1 className="text-3xl font-bold text-center">Repository Donation Setup</h1>

          <div className="w-full bg-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Repository</h2>
              <p className="text-gray-300 font-mono">{setupData.repository}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Provider</h2>
              <p className="text-gray-300">{setupData.provider}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Wallet Address</h2>
              <p className="text-gray-300 font-mono break-all">{setupData.walletPublicKey}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Setup Created</h2>
              <p className="text-gray-300">
                {setupData.createdAt ? new Date(setupData.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            {setupData.userName && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Maintainer</h2>
                <p className="text-gray-300">{setupData.userName}</p>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-800 rounded-lg p-6 space-y-4">
            <DonationButton walletPublicKey={setupData.walletPublicKey} repository={setupData.repository} />
          </div>

          <div className="text-center text-gray-400">
            <p>This repository is configured for automated monthly donations via Tributary protocol.</p>
            <p>Donations are processed transparently on the Solana blockchain.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

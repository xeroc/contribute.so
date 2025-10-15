'use client'

import { Auth } from '~/app/_components/auth'
import { WalletButton } from '~/app/_components/wallet-button'
import { Layout } from '~/app/_components/layout'

export default function Setup() {
  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center pt-16">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <Auth />
          <WalletButton />
        </div>
      </div>
    </Layout>
  )
}

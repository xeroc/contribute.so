'use client'

import { SessionProvider } from 'next-auth/react'
import { TRPCReactProvider } from '~/trpc/react'
import { WalletProviderComponent } from './wallet-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WalletProviderComponent>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </WalletProviderComponent>
    </SessionProvider>
  )
}

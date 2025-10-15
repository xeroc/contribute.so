'use client'

import { SessionProvider } from 'next-auth/react'
import { TRPCReactProvider } from '~/trpc/react'
import { WalletProviderComponent } from './wallet-provider'
import { HeroUIProvider } from '@heroui/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <SessionProvider>
        <WalletProviderComponent>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </WalletProviderComponent>
      </SessionProvider>
    </HeroUIProvider>
  )
}

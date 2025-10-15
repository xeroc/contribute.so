'use client'

import { SubscriptionButton, PaymentInterval } from '@tributary-so/sdk-react'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

interface SubscriptionSectionProps {
  walletPublicKey: string
  repository: string
}

const PAYMENT_GATEWAY_PUBLIC_KEY = new PublicKey('AWqqH2c5zKhBUKrme1D28uQooS54HvAeS1ix8nfQ4bEt')

export function DonationButton({ walletPublicKey, repository }: SubscriptionSectionProps) {
  let recipient: PublicKey
  try {
    recipient = new PublicKey(walletPublicKey)
  } catch {
    console.error('Invalid wallet public key:', walletPublicKey)
    return <div>Invalid wallet configuration</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Support This Repository</h2>
      <SubscriptionButton
        amount={new BN('10000000')} //  eslint-disable-line
        token={new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')} // USDC mint
        recipient={recipient}
        gateway={PAYMENT_GATEWAY_PUBLIC_KEY}
        interval={PaymentInterval.Weekly}
        maxRenewals={12}
        memo={`Monthly donation to ${repository}`}
        label="Donate $10/month"
        radius="sm"
        size="lg"
        executeImmediately={true}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        onSuccess={(tx) => console.log('Donation successful:', tx)}
        onError={(err) => console.error('Donation failed:', err)}
      />
      <p className="text-sm text-gray-400 mt-2">Set up automated monthly donations in USDC via Solana blockchain</p>
    </div>
  )
}

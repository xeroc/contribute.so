'use client'

import { useState, useEffect } from 'react'
import { SubscriptionButton, PaymentInterval } from '@tributary-so/sdk-react'
import { PublicKey, Connection } from '@solana/web3.js'
import { getMint } from '@solana/spl-token'
import { BN } from '@coral-xyz/anchor'
import { env } from '~/env'

interface SubscriptionSectionProps {
  walletPublicKey: string
  repository: string
}

export function DonationButton({ walletPublicKey, repository }: SubscriptionSectionProps) {
  const [decimals, setDecimals] = useState(6) // default to 6 for USDC
  const [selectedAmount, setSelectedAmount] = useState(10)

  useEffect(() => {
    const connection = new Connection(env.NEXT_PUBLIC_SOLANA_RPC_URL)
    const mint = new PublicKey(env.NEXT_PUBLIC_DEFAULT_DONATION_TOKEN_MINT)
    getMint(connection, mint)
      .then((mintInfo) => setDecimals(mintInfo.decimals))
      .catch(console.error)
  }, [])

  let recipient: PublicKey
  let gateway: PublicKey
  let token: PublicKey
  try {
    recipient = new PublicKey(walletPublicKey)
    gateway = new PublicKey(env.NEXT_PUBLIC_PAYMENT_GATEWAY_PUBLIC_KEY)
    token = new PublicKey(env.NEXT_PUBLIC_DEFAULT_DONATION_TOKEN_MINT)
  } catch {
    console.error('Invalid wallet, gateway, or token public key')
    return <div>Invalid configuration</div>
  }

  const amounts = [1, 5, 10, 50]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Support This Repository</h2>
      <div className="flex gap-2 mb-4">
        {amounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            className={`px-4 py-2 rounded-md font-semibold text-sm ${
              selectedAmount === amount ? 'bg-[#9945FF] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>
      <SubscriptionButton
        amount={new BN((selectedAmount * 10 ** decimals).toString())}
        token={token}
        recipient={recipient}
        gateway={gateway}
        interval={PaymentInterval.Monthly}
        maxRenewals={12}
        memo={`Monthly donation to ${repository}`}
        label={`Donate $${selectedAmount}/month`}
        radius="sm"
        size="lg"
        executeImmediately={true}
        className="px-6 py-3 font-semibold bg-gradient-to-r from-[#9945FF] to-[#14F195] border-0 font-bold text-xl text-black"
        onSuccess={(tx) => console.log('Donation successful:', tx)}
        onError={(err) => console.error('Donation failed:', err)}
      />
      <p className="text-sm text-default-600 mt-2">Set up automated monthly donations via Solana blockchain</p>
    </div>
  )
}

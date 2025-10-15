'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface WalletButtonProps {
  onConnect?: (publicKey: string) => void
}

export function WalletButton({ onConnect }: WalletButtonProps = {}) {
  const { publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (publicKey && onConnect) {
      onConnect(publicKey.toBase58())
    }
  }, [publicKey, onConnect])

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !font-bold !py-2 !px-4 !rounded" />
      {publicKey && (
        <p className="text-sm text-gray-300">
          Connected: {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
        </p>
      )}
    </div>
  )
}

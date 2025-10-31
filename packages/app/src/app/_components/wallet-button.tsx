'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '@heroui/react'

interface WalletButtonProps {
  onConnect?: (publicKey: string) => void
  onConfirm?: (publicKey: string) => void
}

export function WalletButton({ onConnect, onConfirm }: WalletButtonProps = {}) {
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
        <button className="bg-secondary-500 hover:bg-secondary-600 text-foreground font-bold py-2 px-4 rounded">
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <WalletMultiButton className="!bg-secondary-500 hover:!bg-secondary-600 !text-foreground !font-bold !py-2 !px-4 !rounded" />
      {publicKey && (
        <div className="mt-6">
          {onConfirm && (
            <Button onClick={() => onConfirm(publicKey.toString())} size="lg">
              Next Step
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import { Button } from '@heroui/react'
import { Copy, Check } from '../icons'
import { addToast } from '@heroui/react'

interface PublicKeyProps {
  publicKey: string
  className?: string
}

export function PublicKeyComponent({ publicKey, className = '' }: PublicKeyProps) {
  const [copying, setCopying] = useState(false)

  const shortenPublicKey = (key: string) => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicKey)
      setCopying(true)
      setTimeout(() => {
        setCopying(false)
      }, 2000)
    } catch (_err) {
      addToast({
        title: 'Error',
        description: 'Copying to clipboard failed!',
        color: 'warning',
      })
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {copying ? (
        <span className="text-xs sm:text-sm text-success flex items-center gap-1.5">
           <Check size={16} className="text-success" />
          Copied!
        </span>
      ) : (
        <>
          <span className="font-mono text-sm">{shortenPublicKey(publicKey)}</span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={copyToClipboard}
            className="ml-1 min-w-unit-6 w-unit-6 h-unit-6"
            title="Copy full public key"
          >
            <Copy size={13} className="text-default-600 hover:text-default-800" />
          </Button>
        </>
      )}
    </span>
  )
}

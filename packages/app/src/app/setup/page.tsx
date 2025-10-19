'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Layout } from '~/app/_components/layout'
import { getUserSetupsAction } from './githubactions'
import { Button } from '@heroui/react'
import { GithubSetup } from './github'
import { TwitterSetup } from './twitter'
import { SetupCompletion } from './setup-completion'
import { WalletButton } from '../_components/wallet-button'

interface UserSetup {
  id: string
  userId: string
  provider: string
  repository: string
  walletPublicKey: string
  createdAt: Date | null
}

type SetupStep = 'wallet' | 'provider' | 'github' | 'twitter' | 'complete'

export default function Setup() {
  const { data: session, status } = useSession()
  const [setups, setSetups] = useState<UserSetup[]>([])
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletPublicKey, setWalletPublicKey] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<SetupStep>('wallet')
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [completedSetup, setCompletedSetup] = useState<{ provider: string; repository: string } | null>(null)
  const [walletConfirmed, setWalletConfirmed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('walletConfirmed');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });

  useEffect(() => {
    if (session?.user) {
      fetchSetups().catch(console.error)
    }
  }, [session])

  useEffect(() => {
    localStorage.setItem('walletConfirmed', JSON.stringify(walletConfirmed));
  }, [walletConfirmed])

  useEffect(() => {
    if (currentStep === 'provider' && session?.user?.provider) {
      setSelectedProvider(session.user.provider)
      setCurrentStep(session.user.provider as SetupStep)
    }
  }, [currentStep, session])

  const fetchSetups = async () => {
    try {
      const userSetups = await getUserSetupsAction()
      setSetups(userSetups)
    } catch (err) {
      console.error('Failed to fetch setups:', err)
    }
  }

  const handleWalletConnect = (publicKey: string) => {
    if (walletConfirmed) {
      setWalletPublicKey(publicKey)
      setWalletConnected(true)
      setCurrentStep('provider')
    }
  }
  const handleWalletConfirm = (publicKey: string) => {
    handleWalletConnect(publicKey);
    setWalletConfirmed(true);
  }

  const handleProviderSelect = (provider: string) => {
    if (!session || session.user?.provider !== provider) {
      signIn(provider).catch(console.error)
      return
    }
    setSelectedProvider(provider)
    setCurrentStep(provider as SetupStep)
  }

  const handleSetupComplete = (provider: string, repository: string) => {
    setCompletedSetup({ provider, repository })
    setCurrentStep('complete')
    fetchSetups().catch(console.error) // Refresh setups
  }

  const back = async (step: SetupStep) => {
    console.log(step)
    if (step == 'wallet') {
      setWalletConnected(false);
      setWalletConfirmed(false);
    }
    if (step == 'provider' || step == 'wallet') {
      console.log("signout")
      await signOut()
      setCurrentStep(step)
    }
  }

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        </div>
      </Layout>
    )
  }

  // Wallet connection is required first
  if (!walletConnected) {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-2xl">
            <div className="w-full bg-gray-800 rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Step 1: Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">Your wallet will receive donations and manage payment policies</p>
              <WalletButton onConnect={handleWalletConnect} onConfirm={handleWalletConfirm} />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Provider selection
  if (currentStep === 'provider') {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-2xl">
            <button
              className="text-gray-400 hover:text-gray-300 text-sm underline self-start"
              onClick={() => back('wallet')}
            >
              ← Back
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Choose Your Platform</h1>
              <p className="text-gray-400 mb-8">Connect a GitHub repository or Twitter account for donations</p>
            </div>

            <div className="w-full space-y-4">
              <Button
                onClick={() => handleProviderSelect('github')}
                className="w-full bg-gray-800 hover:bg-gray-700 p-6 h-auto"
                size="lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">GitHub Repository</h3>
                    <p className="text-sm text-gray-400">Enable donations for your open source projects</p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleProviderSelect('twitter')}
                className="w-full bg-gray-800 hover:bg-gray-700 p-6 h-auto"
                size="lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Twitter Account</h3>
                    <p className="text-sm text-gray-400">Receive donations from your Twitter followers</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // GitHub setup
  if (currentStep === 'github') {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-2xl">
            <button
              className="text-gray-400 hover:text-gray-300 text-sm underline self-start mb-4"
              onClick={() => back('provider')}
            >
              ← Back
            </button>
            <GithubSetup
              walletPublicKey={walletPublicKey}
              onComplete={(repository) => handleSetupComplete('github', repository)}
            />
          </div>
        </div>
      </Layout>
    )
  }

  // Twitter setup
  if (currentStep === 'twitter') {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-2xl">
            <button
              className="text-gray-400 hover:text-gray-300 text-sm underline self-start mb-4"
              onClick={() => back('provider')}
            >
              ← Back
            </button>
            <TwitterSetup
              walletPublicKey={walletPublicKey}
              onComplete={(username) => handleSetupComplete('twitter', username)}
            />
          </div>
        </div>
      </Layout>
    )
  }

  // Completion
  if (currentStep === 'complete' && completedSetup) {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-2xl">
            <button
              className="text-gray-400 hover:text-gray-300 text-sm underline self-start mb-4"
              onClick={() => back('provider')}
            >
              ← Back
            </button>
            <SetupCompletion
              provider={completedSetup.provider}
              repository={completedSetup.repository}
              walletPublicKey={walletPublicKey}
            />
          </div>
        </div>
      </Layout>
    )
  }

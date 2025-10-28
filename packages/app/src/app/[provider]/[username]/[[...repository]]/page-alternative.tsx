'use client'

import { useState } from 'react'
import { Button, Input, Card, CardBody } from '@heroui/react'
import { Github, Twitter, Zap, DollarSign, Check } from 'lucide-react'

type PlatformType = 'github' | 'twitter'

const PRESET_AMOUNTS = [1, 5, 10, 50]

export function HeroUICheckout() {
  const [platform, setPlatform] = useState<PlatformType>('github')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5)
  const [customAmount, setCustomAmount] = useState('')
  const [username, setUsername] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const handleSubscribe = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    alert(`Subscription initiated for ${username} with $${selectedAmount ?? customAmount}`)
  }

  const finalAmount = selectedAmount ?? Number.parseFloat(customAmount) ?? 0

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Platform info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                Support Your Favorite Creators
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed">
                Power the future of open source and digital content with recurring donations
              </p>
            </div>

            {/* Platform selector */}
            <div className="flex gap-3">
              <Button
                color={platform === 'github' ? 'primary' : 'default'}
                variant={platform === 'github' ? 'shadow' : 'bordered'}
                size="lg"
                onClick={() => setPlatform('github')}
                className={`flex-1 ${platform === 'github' ? 'shadow-lg shadow-cyan-500/50' : ''}`}
                startContent={<Github className="w-5 h-5" />}
              >
                GitHub
              </Button>
              <Button
                color={platform === 'twitter' ? 'primary' : 'default'}
                variant={platform === 'twitter' ? 'shadow' : 'bordered'}
                size="lg"
                onClick={() => setPlatform('twitter')}
                className={`flex-1 ${platform === 'twitter' ? 'shadow-lg shadow-cyan-500/50' : ''}`}
                startContent={<Twitter className="w-5 h-5" />}
              >
                Twitter
              </Button>
            </div>

            {/* Platform details card */}
            <Card className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20">
              <CardBody className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      {platform === 'github' ? (
                        <Github className="w-8 h-8 text-cyan-400" />
                      ) : (
                        <Twitter className="w-8 h-8 text-cyan-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {platform === 'github' ? 'GitHub Repository' : 'Twitter Creator'}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {platform === 'github'
                          ? 'Support open source projects and help maintainers continue their work'
                          : 'Back content creators and help them produce more amazing content'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300">Monthly recurring subscription</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300">Cancel anytime, no commitment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300">Direct support to creators</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right side - Checkout form */}
          <Card className="bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 shadow-xl shadow-cyan-500/20">
            <CardBody className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Choose Your Support Level</h2>
                  <p className="text-sm text-slate-400">Select an amount or enter a custom value</p>
                </div>

                {/* Username input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    {platform === 'github' ? 'Repository or Username' : 'Twitter Handle'}
                  </label>
                  <Input
                    placeholder={platform === 'github' ? 'username/repo' : '@username'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    size="lg"
                    classNames={{
                      input: 'bg-slate-800',
                      inputWrapper: 'bg-slate-800 border-slate-700 hover:border-cyan-500',
                    }}
                    startContent={
                      platform === 'github' ? (
                        <Github className="w-5 h-5 text-slate-400" />
                      ) : (
                        <Twitter className="w-5 h-5 text-slate-400" />
                      )
                    }
                  />
                </div>

                {/* Amount selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-200">Monthly Amount</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_AMOUNTS.map((amount) => (
                      <Button
                        key={amount}
                        color={selectedAmount === amount ? 'secondary' : 'default'}
                        variant={selectedAmount === amount ? 'shadow' : 'bordered'}
                        onClick={() => handleAmountSelect(amount)}
                        className={`h-14 text-lg font-semibold ${
                          selectedAmount === amount ? 'shadow-lg shadow-pink-500/50' : ''
                        }`}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Custom Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    size="lg"
                    min="1"
                    step="0.01"
                    classNames={{
                      input: 'bg-slate-800',
                      inputWrapper: 'bg-slate-800 border-slate-700 hover:border-pink-500',
                    }}
                    startContent={<DollarSign className="w-5 h-5 text-slate-400" />}
                  />
                </div>

                {/* Summary */}
                {finalAmount > 0 && username && (
                  <Card className="bg-slate-800/50 border border-slate-700">
                    <CardBody className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Monthly subscription</span>
                        <span className="font-semibold text-white">${finalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Supporting</span>
                        <span className="font-semibold text-cyan-400">{username}</span>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Subscribe button */}
                <Button
                  color="secondary"
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={!username || finalAmount <= 0 || isProcessing}
                  className="w-full h-14 text-lg font-semibold shadow-lg shadow-pink-500/50"
                  startContent={
                    isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )
                  }
                >
                  {isProcessing ? 'Processing...' : 'Subscribe Now'}
                </Button>

                <p className="text-xs text-center text-slate-400 leading-relaxed">
                  By subscribing, you agree to recurring monthly charges. Cancel anytime from your account settings.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HeroUICheckout

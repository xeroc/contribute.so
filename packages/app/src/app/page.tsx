'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Layout } from '~/app/_components/layout'
import CTAButton from './_components/cta-button'

const rotatingColors = [
  'oklch(65% .241 354.308)',
  'oklch(77% .152 181.912)',
  'oklch(82% .189 84.429)',
  'oklch(65% .241 354.308)',
  'oklch(74% .16 232.661)',
  'oklch(76% .177 163.223)',
  'oklch(71% .194 13.428)',
]

export default function Home() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentColorIndex, setCurrentColorIndex] = useState(0)

  // Use API data if available, otherwise fallback to hardcoded values
  const rotatingTexts = [
    'Truly Automated',
    'Trustless & Secure',
    'Lightning Fast',
    'Developer First',
    'Flexible Policies',
    'User Control',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length)
      setCurrentColorIndex(() => Math.floor(Math.random() * rotatingColors.length))
    }, 1800)

    return () => clearInterval(interval)
  }, [rotatingTexts.length])

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.header className="w-full mt-6 mb-6 md:mt-12 gap-2 md:gap-6 flex flex-col md:flex-row-reverse md:items-center">
            <div className="flex flex-col flex-1 items-center md:gap-4">
              <h1
                className={`text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold mt-4 md:mt-0 md:mb-4 ${'md:mt-0'}`}
              >
                contribute.so
              </h1>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentTextIndex}
                  initial={{
                    opacity: 0,
                    y: 20,
                    scale: 0.8,
                    rotate: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotate: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                    scale: 1.8,
                    rotate: 5,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                  style={{
                    backgroundColor: rotatingColors[currentColorIndex],
                    padding: '0.1em 0.4em',
                    borderRadius: '0.2em',
                  }}
                  className="my-4 md:my-0 text-4xl sm:text-5xl lg:text-5xl font-bold text-background inline-block"
                >
                  {rotatingTexts.length > 0 ? rotatingTexts[currentTextIndex] : null}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.header>

          <p className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Recurring crypto donations for GitHub developers. Support open source with automated payments on{' '}
            <span className="text-purple-500 font-extrabold">Solana</span>, backed by Tributary's transparent protocol.
          </p>
          <CTAButton />
        </div>
      </section>

      {/* Tributary Protocol */}
      <section id="tributary" className="py-16 px-4 bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Powered by <a href="https://tributary.so">Tributary Protocol</a>
          </h2>
          <p className="text-lg text-gray-300 mb-6 text-center">
            Tributary is an automated recurring payments protocol on Solana, combining Web2 subscription UX with Web3
            transparency through token delegation.
          </p>
          <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm text-left mb-6">
            <div className="text-blue-400">// How Tributary Works</div>
            <div className="text-green-400">const tributaryFlow = &#123;</div>
            <div className="ml-4 text-yellow-400">delegate: "🎓 Smart contract approved for ATA withdrawals",</div>
            <div className="ml-4 text-yellow-400">policy: "🔧 Configurable recurring payment rules",</div>
            <div className="ml-4 text-yellow-400">execution: "🤖 Automated, transparent on-chain payments",</div>
            <div className="ml-4 text-yellow-400">transparency: "🔒 Immutable blockchain records"</div>
            <div className="text-green-400">&#125;;</div>
          </div>
        </div>
      </section>

      {/* How Contribute Works */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How Monthly GitHub Donations Work</h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold font-mono">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold">Connect Solana Wallet</h3>
                <p className="text-gray-300">
                  Authorize Tributary as delegate for your USDC Associated Token Account (ATA).
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold font-mono">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold">Select GitHub Repository</h3>
                <p className="text-gray-300">
                  Choose the open-source project to support with recurring USDC donations.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold font-mono">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold">Configure Donation Policy</h3>
                <p className="text-gray-300">
                  Set monthly amount, start date, and optional end date. Tributary handles automated execution.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold font-mono">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold">Transparent On-Chain Donations</h3>
                <p className="text-gray-300">
                  Funds transfer automatically via Solana's fast, secure blockchain. Full transparency and auditability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Contribute for GitHub Donations?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">Recurring USDC Payments</h3>
              <p className="text-gray-300">
                Automate monthly donations to GitHub repos using stable USDC on Solana. No manual transfers needed.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Blockchain Transparency</h3>
              <p className="text-gray-300">
                Every donation is recorded on-chain. Verify contributions, track history, and ensure funds reach
                maintainers.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Solana Speed & Low Fees</h3>
              <p className="text-gray-300">
                Leverage Solana's high throughput and minimal transaction costs for efficient, scalable open-source
                funding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Start Supporting Open Source</h2>
          <p className="text-lg text-gray-300 mb-8">
            Join developers funding the ecosystem with transparent, automated monthly donations via USDC on Solana.
          </p>
          <CTAButton />
        </div>
      </section>
    </Layout>
  )
}

'use client'

import { Button } from '@heroui/react'
import Link from 'next/link'
import { Layout } from '~/app/_components/layout'

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Contribute.so
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Simplify monthly donations to GitHub repositories using Solana blockchain. Focus on stable coins like USDC
            for reliable, transparent contributions.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-left max-w-md mx-auto mb-8">
            <div className="text-green-400">$ contribute --repo owner/repo --amount 10 --token USDC</div>
          </div>
          <Link href="/setup">
            <Button size="lg" color="primary" className="font-semibold">
              Start Contributing
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Monthly Donations</h3>
              <p className="text-gray-300">
                Set up recurring contributions to support your favorite open source projects.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🪙</div>
              <h3 className="text-xl font-semibold mb-2">Any Token</h3>
              <p className="text-gray-300">
                Contribute with any Solana token, with a focus on stable coins for stability.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Blockchain Powered</h3>
              <p className="text-gray-300">
                Leverage Solana's speed and security for transparent, immutable donations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it Works</h2>
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
                <p className="text-gray-300">Link your Solana wallet to get started.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold">Choose Repository</h3>
                <p className="text-gray-300">Select the GitHub repo you want to support.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold">Set Up Subscription</h3>
                <p className="text-gray-300">Configure amount, token, and frequency for your monthly contributions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tributary */}
      <section id="tributary" className="py-16 px-4 bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Powered by Tributary</h2>
          <p className="text-lg text-gray-300 mb-6">
            Tributary (tributary.so) is a subscription contract on Solana that provides transparency, is open source and
            extensible, flexible and trustworthy.
          </p>
          <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm text-left">
            <div className="text-blue-400">// Tributary Contract Features</div>
            <div className="text-green-400">const tributary = &#123;</div>
            <div className="ml-4 text-yellow-400">transparent: true,</div>
            <div className="ml-4 text-yellow-400">openSource: true,</div>
            <div className="ml-4 text-yellow-400">extensible: true,</div>
            <div className="ml-4 text-yellow-400">flexible: true,</div>
            <div className="ml-4 text-yellow-400">trustworthy: true</div>
            <div className="text-green-400">&#125;;</div>
          </div>
          <p className="mt-6 text-gray-400">
            Built for developers, by developers. Contribute to the ecosystem that powers innovation.
          </p>
        </div>
      </section>
    </Layout>
  )
}

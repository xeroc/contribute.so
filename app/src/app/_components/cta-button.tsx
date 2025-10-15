'use client'
import { Rocket } from 'lucide-react'
import Link from 'next/link'

export default function CTAButton() {
  return (
    <div className="inline-block">
      <Link href="/setup">
        <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            <span>Start Getting Funded</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </button>
      </Link>
    </div>
  )
}

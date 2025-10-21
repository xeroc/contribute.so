'use client'
import Link from 'next/link'

export default function CTAButton() {
  return (
    <div className="inline-block">
      <Link href="/setup">
        <button className="group relative px-8 py-4 bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600 text-foreground font-bold text-lg rounded-full shadow-lg hover:shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <span>Start Getting Funded</span>
            <span className="text-xl group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform duration-300">
              🚀
            </span>
          </div>
          <div className="absolute inset-0 rounded-full bg-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        </button>
      </Link>
    </div>
  )
}

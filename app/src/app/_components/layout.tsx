'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-mono text-xl font-bold hover:text-blue-400 transition-colors">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Contribute.so" className="w-12 h-12" />
                <span className="text-xl font-semibold">contribute.so</span>
              </div>
            </Link>
            <div className="flex space-x-8 items-center">
              <a href="#features" className="hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-blue-400 transition-colors">
                How it Works
              </a>
              <a href="#tributary" className="hover:text-blue-400 transition-colors">
                Tributary
              </a>
              <Link href="/setup" className="hover:text-blue-400">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={isHome ? '' : 'pt-16'}>{children}</main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-700">
        <div className="max-w-4xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 Contribute.so. Supporting open source with blockchain.</p>
        </div>
      </footer>
    </div>
  )
}

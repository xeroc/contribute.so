import '~/styles/globals.css'

import { type Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Providers } from './_components/providers'

export const metadata: Metadata = {
  title: 'contribute.so',
  description: 'recurring payments',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} dark`}>
      <body className="bg-dark-900 text-gray-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

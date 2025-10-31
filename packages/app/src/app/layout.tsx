import '~/styles/globals.css'

import { type Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Providers } from './_components/providers'
import Script from 'next/script'

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
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Providers>{children}</Providers>
        <Script defer data-domain="contribute.so" src="https://p.chainsquad.com/js/script.js" />
        <Script src="https://cdn.jsdelivr.net/npm/eruda" />
        <Script
          id="eruda"
          dangerouslySetInnerHTML={{
            __html: `eruda.init();`,
          }}
        />
      </body>
    </html>
  )
}

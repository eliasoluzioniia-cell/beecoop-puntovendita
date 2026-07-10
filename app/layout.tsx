import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Raleway, Poppins } from 'next/font/google'
import './globals.css'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-raleway',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Bee Coop - La Follia che si fa Realtà',
  description:
    'Sito ufficiale ed e-commerce della Cooperativa Sociale Bee Coop di Enna. Prodotti agricoli biologici e artigianato locale creati per sostenere l\'integrazione e la dignità lavorativa.',
  generator: 'Bee Coop CMS',
}

export const viewport: Viewport = {
  themeColor: '#2487ce',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className={`dark ${raleway.variable} ${poppins.variable}`}>
      <body className="bg-background font-sans antialiased text-white selection:bg-amber-400 selection:text-black">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

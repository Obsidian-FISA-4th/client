import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Woori Eoseo-Obsidian',
  description: 'A powerful markdown editor inspired by Obsidian',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

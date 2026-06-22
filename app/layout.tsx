import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pikirler - The World of Thoughts',
  description: 'Pikirleriň dünýäsi – Share your thoughts and ideas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-primary text-text">
        {children}
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '캘린더',
  description: '나만의 캘린더 앱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body
        className="bg-gray-50 text-gray-900 antialiased"
        style={{ fontFamily: "'Pretendard', -apple-system, sans-serif" }}
      >
        {children}
      </body>
    </html>
  )
}
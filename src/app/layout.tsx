import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://calzeb.askwhy.works'),
  title: {
    default: 'CalZEB | Zero Energy Building Calculator',
    template: '%s | CalZEB',
  },
  description: 'ISO 52016 국제표준 기반 건물에너지 부하 및 소요량 계산기. 태양광 발전량 예측, 경제성 분석(NPV, Payback, LCOE), ZEB 등급 자동 판정.',
  keywords: [
    'CalZEB', 'ZEB', 'Zero Energy Building', '제로에너지건물',
    '건물에너지계산기', '에너지소요량', 'ISO 52016', '태양광발전량',
    'NPV', 'Payback', 'LCOE', 'REC', '경제성분석',
  ],
  authors: [{ name: 'EAN Technology', url: 'https://eantec.co.kr' }],
  creator: 'EAN Technology Research Division',
  openGraph: {
    title: 'CalZEB - Zero Energy Building Calculator',
    description: 'ISO 52016 기반 건물에너지 계산기. 부하계산, 태양광 예측, 경제성 분석',
    url: 'https://calzeb.askwhy.works',
    siteName: 'CalZEB',
    locale: 'ko_KR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#dc2626',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10001] focus:bg-slate-900 focus:text-white focus:px-6 focus:py-3 focus:rounded focus:shadow-lg"
        >
          본문으로 바로가기
        </a>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}

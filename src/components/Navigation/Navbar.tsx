'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const storedUsername = localStorage.getItem('username')
    setIsLoggedIn(!!token)
    setUsername(storedUsername || '')
  }, [pathname])

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    setIsLoggedIn(false)
    setUsername('')
    router.push('/')
  }

  // CalZEB 전용 네비게이션 (간소화)
  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'MY PROJECTS', href: '/' },  // 로그인 후 프로젝트 목록으로
  ]

  return (
    <div className={`fixed left-0 right-0 z-50 flex justify-center transition-all duration-700 ${
      isScrolled ? 'top-8' : 'top-0'
    }`}>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[92%] max-w-5xl"
        whileHover={{
          y: -4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 16px 64px rgba(0,0,0,0.08), 0 24px 96px rgba(0,0,0,0.06)'
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <div className={`relative px-8 py-4 transition-all duration-700 backdrop-blur-2xl ${
          isScrolled
            ? 'border border-slate-200/60 bg-white text-slate-900 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.06),0_16px_64px_rgba(0,0,0,0.04)] rounded-2xl'
            : 'border-b border-white/15 bg-white/10 text-white shadow-none rounded-none'
        }`}>

          {/* 상단 눈금 - 1:100 축척 */}
          {isScrolled && (
            <div className="absolute top-0 left-0 right-0 h-3 border-b border-slate-200">
              <span className="absolute left-2 top-0.5 text-[8px] font-mono text-slate-400">1:100</span>
              <div className="absolute top-0 left-16 right-16 h-full flex items-start">
                <div className="w-full flex justify-between">
                  {[...Array(26)].map((_, i) => {
                    const isMajor = i % 5 === 0
                    return (
                      <div
                        key={`top-${i}`}
                        className={`${
                          isMajor
                            ? 'h-2.5 w-[1.5px] bg-slate-400'
                            : 'h-1.5 w-[1px] bg-slate-300'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
              <span className="absolute right-2 top-0.5 text-[8px] font-mono text-slate-400">100</span>
            </div>
          )}

          {/* 좌측 세로 눈금 */}
          {isScrolled && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={`left-${i}`} className="w-1.5 h-[1px] bg-slate-300/60" />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            {/* Logo - CalZEB */}
            <Link href="/" className="flex items-center space-x-3" aria-label="CalZEB 홈으로 이동">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <div className={`text-xl font-normal tracking-wide transition-colors duration-300 ${
                  isScrolled ? 'text-slate-900' : 'text-white'
                }`}>
                  CalZEB<span className="text-red-600">.</span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {navItems.map((item, index) => (
                  <Link key={index} href={item.href}>
                    <motion.div
                      className={`px-4 py-2 text-sm font-normal tracking-wide transition-colors duration-300 relative group ${
                        isScrolled
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-white/80 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-4 right-4 h-[3px] bg-red-600 transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                    </motion.div>
                  </Link>
                ))}

                {/* 연구본부 홈페이지 링크 */}
                <a
                  href="https://askwhy.works"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 text-sm font-normal tracking-wide transition-colors duration-300 ${
                    isScrolled
                      ? 'text-slate-400 hover:text-slate-600'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  연구본부
                </a>
              </div>

              {/* Auth Links */}
              <div className="flex items-center space-x-1 ml-3">
                <div className={`h-4 w-[0.5px] mx-2 ${isScrolled ? 'bg-slate-200' : 'bg-white/20'}`} />

                {isLoggedIn ? (
                  <>
                    <span className={`px-3 py-2 text-sm font-normal ${
                      isScrolled ? 'text-slate-600' : 'text-white/80'
                    }`}>
                      {username}님
                    </span>
                    <button
                      onClick={handleLogout}
                      className={`px-4 py-2 text-sm font-normal tracking-wide transition-colors duration-300 ${
                        isScrolled
                          ? 'text-slate-600 hover:text-red-600'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <motion.div
                        className={`px-4 py-2 text-sm font-normal tracking-wide transition-colors duration-300 ${
                          isScrolled
                            ? 'text-slate-600 hover:text-slate-900'
                            : 'text-white/80 hover:text-white'
                        }`}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        SIGN IN
                      </motion.div>
                    </Link>
                    <Link href="/register">
                      <motion.div
                        className={`px-4 py-2 text-sm font-normal tracking-wide transition-colors duration-300 ${
                          isScrolled
                            ? 'text-slate-600 hover:text-slate-900'
                            : 'text-white/80 hover:text-white'
                        }`}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        SIGN UP
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className={`md:hidden p-2 ${isScrolled ? 'text-slate-900' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>

          {/* 우측 세로 눈금 */}
          {isScrolled && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={`right-${i}`} className="w-1.5 h-[1px] bg-slate-300/60" />
              ))}
            </div>
          )}

          {/* 하단 눈금 - 1:200 축척 */}
          {isScrolled && (
            <div className="absolute bottom-0 left-0 right-0 h-3 border-t border-slate-200">
              <span className="absolute left-2 bottom-0.5 text-[8px] font-mono text-slate-400">1:200</span>
              <div className="absolute bottom-0 left-16 right-16 h-full flex items-end">
                <div className="w-full flex justify-between">
                  {[...Array(51)].map((_, i) => {
                    const isMajor = i % 10 === 0
                    const isMedium = i % 5 === 0 && i % 10 !== 0
                    return (
                      <div
                        key={`bottom-${i}`}
                        className={`${
                          isMajor
                            ? 'h-2.5 w-[1.5px] bg-slate-400'
                            : isMedium
                            ? 'h-2 w-[1px] bg-slate-300'
                            : 'h-1.5 w-[0.5px] bg-slate-300/60'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
              <span className="absolute right-2 bottom-0.5 text-[8px] font-mono text-slate-400">200</span>
            </div>
          )}

          {/* 입체감 효과 */}
          {isScrolled && (
            <>
              <div className="absolute top-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/80 via-white/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-slate-50/10 pointer-events-none" />
            </>
          )}

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 bg-amber-50/98 backdrop-blur-2xl rounded-2xl p-4 border border-gray-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
              >
                {navItems.map((item, index) => (
                  <Link key={index} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.div
                      className="block py-3 text-slate-600 hover:text-slate-900 transition-colors font-normal"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                ))}

                {/* 연구본부 링크 (모바일) */}
                <a
                  href="https://askwhy.works"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-3 text-slate-400 hover:text-slate-600 transition-colors font-normal text-sm"
                >
                  연구본부 홈페이지
                </a>

                {/* Auth Links in Mobile */}
                <div className="mt-2 pt-3 border-t border-slate-200/40">
                  {isLoggedIn ? (
                    <>
                      <div className="py-2 text-slate-600 text-sm">{username}님</div>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="block py-3 text-red-600 hover:text-red-700 transition-colors font-normal text-sm"
                      >
                        LOGOUT
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div
                          className="block py-3 text-slate-600 hover:text-slate-900 transition-colors font-normal text-sm tracking-wide"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: navItems.length * 0.1 }}
                        >
                          SIGN IN
                        </motion.div>
                      </Link>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div
                          className="block py-3 text-slate-600 hover:text-slate-900 transition-colors font-normal text-sm tracking-wide"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (navItems.length + 1) * 0.1 }}
                        >
                          SIGN UP
                        </motion.div>
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </div>
  )
}

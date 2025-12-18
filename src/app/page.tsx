// CalZEB - 건물에너지계산기 메인 페이지
// Design: LESS IS MORE Minimalism (docs/05_design)
// - 배경 투명 + 얇은 라인만
// - 단일 포인트 컬러: red-600
// - 이모지 금지, Glassmorphism 금지, 그림자 금지

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navigation/Navbar'
import Footer from '@/components/Navigation/Footer'
import ScrollToTop from '@/components/UI/ScrollToTop'
import ProjectList from '@/components/CalZEB/ProjectList'
import ProjectCreateForm from '@/components/CalZEB/ProjectCreateForm'
import { SkeletonProjectGrid } from '@/components/UI/Skeleton'
import type { Project } from '@/lib/calzeb/types'

export default function CalZEBPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.askwhy.works'

      const response = await fetch(`${API_URL}/calzeb/projects`)

      if (!response.ok) throw new Error('프로젝트 로딩 실패')

      const data = await response.json()
      setProjects(data.projects)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('프로젝트 로딩 중 오류가 발생했습니다')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-50">
        {/* Hero Section - BoLumiCloud Style */}
        <section className="py-24 px-8 bg-amber-50/50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-extralight mb-4 text-slate-900 tracking-tighter">
                CalZEB: Zer<span className="text-red-600">o</span> Energy Building Calculator
              </h1>
              <div className="w-24 h-px bg-gray-300 mb-6"></div>
              <p className="text-base text-slate-500 font-normal max-w-3xl leading-[1.8]">
                <strong className="text-slate-700">ISO 52016(구 ISO 13790)</strong> 국제 표준 기반 건물에너지 부하 및 소요량 5종 계산 엔진.<br />
                <strong className="text-slate-700">NREL pvlib-python</strong>으로 <strong className="text-slate-700">태양광 발전량 정밀 예측</strong>. 경사각·방위각·음영·온도계수·양면형 모듈 완벽 반영, 실제 발전량 대비 오차율 &lt;5% 달성.<br />
                <strong className="text-slate-700">경제성 3대 지표</strong>(NPV 20년, Payback, LCOE) 및 <strong className="text-slate-700">REC 판매 수익</strong> 분석.<br />
                <strong className="text-slate-700">온실가스 감축량</strong> 계산 후 소나무 그루수·승용차 대수로 직관적 환산.
                월별 12개월 에너지 패턴을 kWh ↔ kWh/m² 토글로 시각화.
                국토교통부 ZEB 인증 기준 준수.<br />
                <span className="text-slate-400 text-sm">✓ 실시간 계산(&lt;1초) | Alternative 무제한 비교</span>
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8"
            >
              <button
                onClick={() => setShowCreateForm(true)}
                className="border-2 border-red-600 bg-red-600 text-white px-8 py-3 text-sm font-bold hover:bg-red-700 transition-colors duration-150"
              >
                나의 프로젝트 생성
              </button>
            </motion.div>
          </div>
        </section>

        {/* 프로젝트 목록 */}
        <section className="py-16 px-8 border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-black">
                프로젝트 목록
              </h2>
              <button
                onClick={loadProjects}
                className="border-2 border-gray-300 px-4 py-2 text-sm font-bold text-black hover:border-black transition-colors duration-150"
              >
                새로고침
              </button>
            </div>

            {loading && <SkeletonProjectGrid />}

            {error && (
              <div className="border-l-4 border-red-600 bg-red-50 pl-4 py-4">
                <p className="text-base font-bold text-red-600 mb-2">오류가 발생했습니다</p>
                <p className="text-sm font-medium text-gray-700">{error}</p>
              </div>
            )}

            {!loading && !error && <ProjectList projects={projects} onRefresh={loadProjects} />}
          </div>
        </section>

        {/* 프로젝트 생성 모달 */}
        {showCreateForm && (
          <ProjectCreateForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false)
              loadProjects()
            }}
          />
        )}

        {/* 개발 현황 - Line-based Minimal Cards */}
        <section className="py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black mb-12 text-black">
              개발 진행 상황
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Phase 0-2.5 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-gray-200 p-6 hover:border-red-600 transition-all duration-150"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                  <h3 className="font-bold text-black">Phase 0-2.5</h3>
                  <span className="border-2 border-red-600 text-red-600 px-3 py-1 text-sm font-bold">
                    완료
                  </span>
                </div>
                <ul className="text-sm font-medium text-black space-y-2">
                  <li className="border-l-4 border-red-600 pl-3 font-bold">Backend 모듈화 (85% 코드 감소)</li>
                  <li className="border-l-2 border-gray-400 pl-3">BESS 계산 엔진 (8개)</li>
                  <li className="border-l-2 border-gray-400 pl-3">Database (3개 테이블)</li>
                  <li className="border-l-2 border-gray-400 pl-3">프로젝트 API (5개)</li>
                  <li className="border-l-2 border-gray-400 pl-3">18개 테스트 통과</li>
                </ul>
              </motion.div>

              {/* Phase 4-6 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border border-gray-200 p-6 hover:border-red-600 transition-all duration-150"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                  <h3 className="font-bold text-black">Phase 4-6</h3>
                  <span className="border-2 border-red-600 text-red-600 px-3 py-1 text-sm font-bold">
                    완료
                  </span>
                </div>
                <ul className="text-sm font-medium text-black space-y-2">
                  <li className="border-l-4 border-red-600 pl-3 font-bold">Alternative 비교</li>
                  <li className="border-l-2 border-gray-400 pl-3">경제성 분석 (NPV, Payback, REC)</li>
                  <li className="border-l-2 border-gray-400 pl-3">온실가스 감축량 (소나무·승용차)</li>
                  <li className="border-l-2 border-gray-400 pl-3">월별 시각화 (단위 전환)</li>
                </ul>
              </motion.div>

              {/* Phase 7 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="border border-gray-200 p-6 hover:border-red-600 transition-all duration-150"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                  <h3 className="font-bold text-black">Phase 7</h3>
                  <span className="border-2 border-red-600 text-red-600 px-3 py-1 text-sm font-bold">
                    완료
                  </span>
                </div>
                <ul className="text-sm font-medium text-black space-y-2">
                  <li className="border-l-4 border-red-600 pl-3 font-bold">비교 대시보드</li>
                  <li className="border-l-2 border-gray-400 pl-3">Plotly 차트 (막대, 산점도, 레이더)</li>
                  <li className="border-l-2 border-gray-400 pl-3">정렬/필터</li>
                  <li className="border-l-2 border-gray-400 pl-3">추천 로직 (상위 3개)</li>
                </ul>
              </motion.div>
            </div>

            {/* 진행률 - Minimal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="border border-gray-200 p-6"
            >
              <div className="flex justify-between text-sm font-bold text-black mb-3">
                <span>전체 진행률</span>
                <span className="font-black">90% (Phase 4-7 완료)</span>
              </div>
              <div className="w-full border border-gray-200 h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '90%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-red-600 h-2"
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 작동하는 API - Minimal */}
        <section className="py-16 px-8 border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black mb-12 text-black">
              작동하는 API (Phase 2.5 완료)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 프로젝트 목록 */}
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="font-bold text-black mb-4">프로젝트 목록</h3>
                {loading && <p className="text-sm font-bold text-black">로딩 중...</p>}
                {error && <p className="text-sm font-bold text-red-600">{error}</p>}
                {!loading && !error && (
                  <div>
                    <p className="text-sm font-semibold text-black mb-4">총 {projects.length}개 프로젝트</p>
                    {projects.length > 0 ? (
                      <ul className="space-y-3">
                        {projects.slice(0, 3).map((proj) => (
                          <li key={proj.project_id} className="pb-3 border-b border-gray-100 last:border-0">
                            <div className="font-bold text-black">{proj.name}</div>
                            <div className="text-xs font-medium text-gray-700 mt-1">
                              {proj.building_type} | {proj.area}m² | {proj.alternatives_count}개 Alt
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm font-medium text-gray-600 italic border-l-2 border-gray-300 pl-3">
                        아직 프로젝트가 없습니다. Backend에서 생성 가능합니다.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 구현된 API */}
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="font-bold text-black mb-4">구현된 API (5개)</h3>
                <ul className="space-y-3 text-sm font-medium text-black">
                  <li className="flex items-start border-b border-gray-100 pb-2">
                    <code className="text-xs border border-gray-300 px-2 py-1 mr-2">POST</code>
                    <span className="flex-1">/calculate-simple (P95: 4ms)</span>
                  </li>
                  <li className="flex items-start border-b border-gray-100 pb-2">
                    <code className="text-xs border border-gray-300 px-2 py-1 mr-2">POST</code>
                    <span className="flex-1">/projects</span>
                  </li>
                  <li className="flex items-start border-b border-gray-100 pb-2">
                    <code className="text-xs border border-gray-300 px-2 py-1 mr-2">GET</code>
                    <span className="flex-1">/projects</span>
                  </li>
                  <li className="flex items-start border-b border-gray-100 pb-2">
                    <code className="text-xs border border-gray-300 px-2 py-1 mr-2">GET</code>
                    <span className="flex-1">/projects/&#123;id&#125;</span>
                  </li>
                  <li className="flex items-start">
                    <code className="text-xs border border-gray-300 px-2 py-1 mr-2">POST</code>
                    <span className="flex-1">/alternatives</span>
                  </li>
                </ul>

                {/* Swagger UI 링크 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href="https://api.askwhy.works/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-bold text-red-600 hover:text-red-800 border-b-2 border-red-600 transition-colors duration-150"
                  >
                    Swagger UI에서 API 테스트하기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  )
}

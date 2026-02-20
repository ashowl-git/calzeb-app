// CalZEB 프로젝트 상세 페이지
// Design: LESS IS MORE Minimalism + 블랙 볼드체 (가독성 개선)
// Features: Alternative 관리, 계산 결과 표시

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navigation/Navbar'
import Footer from '@/components/Navigation/Footer'
import ScrollToTop from '@/components/UI/ScrollToTop'
import ExcelUpload from '@/components/CalZEB/ExcelUpload'
import { ComparisonDashboard } from '@/components/CalZEB/ComparisonDashboard'
import AlternativeInputForm from '@/components/CalZEB/AlternativeInputForm'
import MonthlyEnergyChart from '@/components/CalZEB/MonthlyEnergyChart'
import { SkeletonProjectDetail } from '@/components/UI/Skeleton'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [alternatives, setAlternatives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [selectedAltResults, setSelectedAltResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'excel' | 'compare'>('list')
  const [editingAlt, setEditingAlt] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const loadProjectData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.askwhy.works'

      // 프로젝트 정보 로드
      const projectRes = await fetch(`${API_URL}/calzeb/projects/${projectId}`)
      if (!projectRes.ok) throw new Error('프로젝트를 찾을 수 없습니다')
      const projectData = await projectRes.json()

      console.log('[ProjectDetail] 프로젝트 데이터:', projectData)

      // Backend 응답은 { status: "success", project: {...} } 구조
      setProject(projectData.project)

      // Alternative 목록 로드
      try {
        const altRes = await fetch(`${API_URL}/calzeb/projects/${projectId}/alternatives`)
        if (altRes.ok) {
          const altData = await altRes.json()
          console.log('[ProjectDetail] Alternative 목록:', altData)
          setAlternatives(altData.alternatives || [])
        }
      } catch (altError) {
        console.warn('[ProjectDetail] Alternative 목록 로드 실패:', altError)
        // 목록 로드 실패해도 프로젝트는 표시
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadProjectData()
  }, [loadProjectData])

  const handleDeleteAlt = async (altId: number, altName: string) => {
    if (!confirm(`'${altName}' Alternative를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.askwhy.works'
      const response = await fetch(`${API_URL}/calzeb/projects/${projectId}/alternatives/${altId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('삭제 실패')

      alert('삭제되었습니다')
      loadProjectData()
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`)
    }
  }

  const handleEditAlt = async (alt: any) => {
    setEditingAlt(alt)
    setShowEditModal(true)
  }

  const handleCopyAlt = async (alt: any) => {
    const copiedAlt = {
      ...alt,
      alt_name: `${alt.alt_name} (복사)`,
      id: undefined  // 새로운 Alternative로 생성
    }
    setEditingAlt(copiedAlt)
    setShowEditModal(true)
  }

  const handleShowResults = async (alt: any) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.askwhy.works'
      const response = await fetch(`${API_URL}/calzeb/projects/${projectId}/alternatives`)
      if (!response.ok) throw new Error('결과 조회 실패')

      const data = await response.json()
      const altWithResults = data.alternatives.find((a: any) => a.id === alt.id)

      // input_data 파싱
      const inputData = typeof altWithResults.input_data === 'string'
        ? JSON.parse(altWithResults.input_data)
        : altWithResults.input_data || {}

      // calculation 결과에서 monthly 데이터 추출
      const calculationResults = altWithResults.calculation_results
      const monthlyData = calculationResults?.monthly || []

      setSelectedAltResults({
        ...altWithResults,
        input_data: inputData,
        monthly_data: monthlyData  // 월별 데이터 추가
      })
      setShowResultsModal(true)
    } catch (err: any) {
      alert(`결과 조회 실패: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 px-8 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-50">
          <div className="max-w-7xl mx-auto py-12">
            <SkeletonProjectDetail />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !project) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="border-l-4 border-red-600 pl-6 py-4">
              <p className="text-base font-bold text-black mb-2">오류가 발생했습니다</p>
              <p className="text-sm font-normal text-gray-700">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 border-2 border-black bg-black text-white px-6 py-2 text-sm font-bold hover:bg-gray-900 transition-colors"
              >
                ← 목록으로 돌아가기
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-50">
        {/* 프로젝트 헤더 */}
        <section className="py-12 px-8 border-b-2 border-gray-200 bg-amber-50/80">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* 뒤로가기 + 제목 */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => router.push('/')}
                  className="border-2 border-gray-300 px-4 py-2 text-sm font-bold text-black hover:border-black transition-colors"
                >
                  ← 목록
                </button>
                <h1 className="text-4xl font-black text-black">{project.name}</h1>
              </div>

              {/* 프로젝트 기본 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="border-2 border-gray-200 p-4 bg-white">
                  <p className="text-xs font-bold text-gray-500 mb-2">건물 용도</p>
                  <p className="text-base md:text-lg font-black text-black">{project.building_type}</p>
                </div>
                <div className="border-2 border-gray-200 p-4 bg-white">
                  <p className="text-xs font-bold text-gray-500 mb-2">연면적</p>
                  <p className="text-base md:text-lg font-black text-black">{project.area?.toLocaleString()} m²</p>
                </div>
                <div className="border-2 border-gray-200 p-4 bg-white">
                  <p className="text-xs font-bold text-gray-500 mb-2">위치</p>
                  <p className="text-base md:text-lg font-black text-black">{project.location}</p>
                </div>
                <div className="border-2 border-gray-200 p-4 bg-white">
                  <p className="text-xs font-bold text-gray-500 mb-2">Alternative</p>
                  <p className="text-base md:text-lg font-black text-red-600">{alternatives.length}개</p>
                </div>
              </div>

              {project.description && (
                <div className="mt-6 border-l-4 border-red-600 pl-4">
                  <p className="text-sm font-normal text-black">{project.description}</p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* 탭 네비게이션 */}
        <section className="py-4 md:py-8 px-4 md:px-8 border-b-2 border-gray-200 sticky top-16 bg-white z-10">
          <div className="max-w-7xl mx-auto overflow-x-auto">
            <div className="flex gap-2 min-w-max md:min-w-0">
              <button
                onClick={() => setActiveTab('list')}
                className={`
                  px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold transition-all duration-150 whitespace-nowrap
                  ${activeTab === 'list'
                    ? 'border-b-4 border-red-600 text-black'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-black'
                  }
                `}
              >
                Alternative 목록
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`
                  px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold transition-all duration-150 whitespace-nowrap
                  ${activeTab === 'form'
                    ? 'border-b-4 border-blue-600 text-black'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-black'
                  }
                `}
              >
                + 새 Alt 추가
              </button>
              <button
                onClick={() => setActiveTab('excel')}
                className={`
                  px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold transition-all duration-150 whitespace-nowrap
                  ${activeTab === 'excel'
                    ? 'border-b-4 border-gray-600 text-black'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-black'
                  }
                `}
              >
                Excel 일괄 업로드
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`
                  px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold transition-all duration-150 whitespace-nowrap
                  ${activeTab === 'compare'
                    ? 'border-b-4 border-green-600 text-black'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-black'
                  }
                `}
              >
                비교 분석
              </button>
            </div>
          </div>
        </section>

        {/* Alternative 목록 탭 */}
        {activeTab === 'list' && (
          <section className="py-12 px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-black">Alternative 목록</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('excel')}
                    className="border-2 border-red-600 bg-red-600 text-white px-6 py-3 text-sm font-bold hover:bg-red-700 transition-colors"
                  >
                    + Excel 업로드로 추가
                  </button>
                </div>
              </div>

            {alternatives.length === 0 ? (
              <div className="border-2 border-gray-200 p-16 text-center">
                <div className="border-t-4 border-red-600 w-24 mx-auto mb-6"></div>
                <p className="text-lg font-bold text-black mb-2">
                  아직 Alternative가 없습니다
                </p>
                <p className="text-sm font-normal text-gray-700 mb-6">
                  Excel 파일을 업로드하여 ZEB 등급 계산을 시작하세요
                </p>
                <button
                  onClick={() => setActiveTab('excel')}
                  className="border-2 border-black bg-black text-white px-8 py-3 text-sm font-bold hover:bg-gray-900 transition-colors"
                >
                  Excel 업로드로 Alternative 추가
                </button>
              </div>
            ) : (
              <div className="border-2 border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="border-b-2 border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 md:px-6 py-4 text-left text-sm font-black text-black">이름</th>
                      <th className="px-4 md:px-6 py-4 text-left text-sm font-black text-black">설명</th>
                      <th className="px-4 md:px-6 py-4 text-right text-sm font-black text-black">1차 에너지</th>
                      <th className="px-4 md:px-6 py-4 text-center text-sm font-black text-black">ZEB 등급</th>
                      <th className="px-4 md:px-6 py-4 text-center text-sm font-black text-black">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((alt, idx) => (
                      <tr key={alt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td
                          className="px-4 md:px-6 py-4 text-sm font-bold text-black cursor-pointer hover:text-red-600 transition-colors"
                          onClick={() => handleShowResults(alt)}
                        >
                          {alt.alt_name}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm font-normal text-gray-700">{alt.description}</td>
                        <td className="px-4 md:px-6 py-4 text-sm font-bold text-right text-black">
                          {alt.primary_energy?.toFixed(1)} kWh/m²·yr
                        </td>
                        <td className="px-4 md:px-6 py-4 text-center">
                          <span className="border-2 border-red-600 bg-red-600 text-white px-2 md:px-3 py-1 text-xs font-bold">
                            {alt.zeb_grade || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center flex-wrap">
                            <button
                              onClick={() => handleShowResults(alt)}
                              className="border-2 border-blue-600 text-blue-600 px-2 md:px-3 py-1 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors"
                            >
                              결과
                            </button>
                            <button
                              onClick={() => handleEditAlt(alt)}
                              className="border-2 border-gray-300 px-2 md:px-3 py-1 text-xs font-bold text-black hover:border-black transition-colors"
                            >
                              편집
                            </button>
                            <button
                              onClick={() => handleCopyAlt(alt)}
                              className="border-2 border-gray-300 px-2 md:px-3 py-1 text-xs font-bold text-black hover:border-blue-600 hover:text-blue-600 transition-colors"
                            >
                              복사
                            </button>
                            <button
                              onClick={() => handleDeleteAlt(alt.id, alt.alt_name)}
                              className="border-2 border-red-600 text-red-600 px-2 md:px-3 py-1 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </section>
        )}

        {/* Excel 업로드 탭 */}
        {activeTab === 'excel' && (
          <section className="py-12 px-8">
            <div className="max-w-7xl mx-auto">
              {/* 알파 테스트 알림 */}
              <div className="border-4 border-blue-600 bg-blue-50 p-8 mb-8 text-center">
                <h3 className="text-2xl font-black text-blue-900 mb-4">
                  📋 Excel 일괄 업로드 기능
                </h3>
                <p className="text-lg font-bold text-blue-800 mb-2">
                  알파 테스트 완료 후 진행 예정
                </p>
                <p className="text-sm text-blue-700">
                  현재 버전에서는 "+ 새 Alt 추가" 탭에서 개별 입력을 이용해주세요.
                </p>
              </div>

              <ExcelUpload
                projectId={parseInt(projectId)}
                mode="simple"
                onSuccess={loadProjectData}
              />
            </div>
          </section>
        )}

        {/* 새 Alt 추가 탭 (v3.1) */}
        {activeTab === 'form' && (
          <section className="py-12 px-8 bg-blue-50/30">
            <div className="max-w-6xl mx-auto">
              <AlternativeInputForm
                project={project}
                onSave={() => {
                  setActiveTab('list')
                  loadProjectData()
                }}
                onCancel={() => setActiveTab('list')}
              />
            </div>
          </section>
        )}

        {/* 비교 분석 탭 (v3.1: results → compare) */}
        {activeTab === 'compare' && (
          <section className="py-12 px-8">
            <div className="max-w-7xl mx-auto">
              <ComparisonDashboard projectId={parseInt(projectId)} />
            </div>
          </section>
        )}

        {/* 계산 결과 상세 모달 */}
        {showResultsModal && selectedAltResults && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowResultsModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-4 border-black max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b-4 border-gray-200 p-6 bg-gradient-to-r from-amber-50 to-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-black mb-2">{selectedAltResults.alt_name}</h2>
                    <p className="text-sm font-semibold text-gray-600">{selectedAltResults.description}</p>
                  </div>
                  <button
                    onClick={() => setShowResultsModal(false)}
                    className="text-gray-400 hover:text-black transition-colors duration-150 font-black text-3xl leading-none"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                {/* ZEB 등급 및 자립률 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-2 border-red-600 p-6 bg-red-50">
                    <p className="text-xs font-bold text-gray-600 mb-2">ZEB 등급</p>
                    <p className="text-4xl font-black text-red-600">{selectedAltResults.zeb_grade || 'N/A'}</p>
                  </div>
                  <div className="border-2 border-blue-600 p-6 bg-blue-50">
                    <p className="text-xs font-bold text-gray-600 mb-2">에너지 자립률</p>
                    <p className="text-4xl font-black text-blue-600">{selectedAltResults.self_sufficiency_rate?.toFixed(1)}%</p>
                  </div>
                </div>

                {/* 1차 에너지 */}
                <div className="border-2 border-gray-200 p-6">
                  <h3 className="text-xl font-black text-black mb-4 pb-3 border-b-2 border-gray-200">
                    1차 에너지 소요량
                  </h3>
                  <p className="text-3xl font-black text-black">
                    {selectedAltResults.primary_energy?.toFixed(1)} <span className="text-lg font-medium text-gray-600">kWh/m²·년</span>
                  </p>
                </div>

                {/* 에너지원별 상세 */}
                <div className="border-2 border-gray-200 p-6">
                  <h3 className="text-xl font-black text-black mb-4 pb-3 border-b-2 border-gray-200">
                    에너지원별 상세
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-orange-50 border-2 border-orange-200 p-4">
                      <p className="text-xs font-bold text-gray-600 mb-1">난방</p>
                      <p className="text-lg font-black text-orange-600">
                        {selectedAltResults.calculation_results?.annual_summary?.heating
                          ? (selectedAltResults.calculation_results.annual_summary.heating / project.area).toFixed(1)
                          : 'N/A'}
                        {selectedAltResults.calculation_results?.annual_summary?.heating && (
                          <span className="text-xs font-medium ml-1 text-gray-600">kWh/m²·yr</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-200 p-4">
                      <p className="text-xs font-bold text-gray-600 mb-1">냉방</p>
                      <p className="text-lg font-black text-blue-600">
                        {selectedAltResults.calculation_results?.annual_summary?.cooling
                          ? (selectedAltResults.calculation_results.annual_summary.cooling / project.area).toFixed(1)
                          : 'N/A'}
                        {selectedAltResults.calculation_results?.annual_summary?.cooling && (
                          <span className="text-xs font-medium ml-1 text-gray-600">kWh/m²·yr</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-red-50 border-2 border-red-200 p-4">
                      <p className="text-xs font-bold text-gray-600 mb-1">급탕</p>
                      <p className="text-lg font-black text-red-600">
                        {selectedAltResults.calculation_results?.annual_summary?.hot_water
                          ? (selectedAltResults.calculation_results.annual_summary.hot_water / project.area).toFixed(1)
                          : 'N/A'}
                        {selectedAltResults.calculation_results?.annual_summary?.hot_water && (
                          <span className="text-xs font-medium ml-1 text-gray-600">kWh/m²·yr</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-yellow-50 border-2 border-yellow-200 p-4">
                      <p className="text-xs font-bold text-gray-600 mb-1">조명</p>
                      <p className="text-lg font-black text-yellow-600">
                        {selectedAltResults.calculation_results?.annual_summary?.lighting
                          ? (selectedAltResults.calculation_results.annual_summary.lighting / project.area).toFixed(1)
                          : 'N/A'}
                        {selectedAltResults.calculation_results?.annual_summary?.lighting && (
                          <span className="text-xs font-medium ml-1 text-gray-600">kWh/m²·yr</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 border-2 border-green-200 p-4">
                      <p className="text-xs font-bold text-gray-600 mb-1">환기</p>
                      <p className="text-lg font-black text-green-600">
                        {selectedAltResults.calculation_results?.annual_summary?.ventilation
                          ? (selectedAltResults.calculation_results.annual_summary.ventilation / project.area).toFixed(1)
                          : 'N/A'}
                        {selectedAltResults.calculation_results?.annual_summary?.ventilation && (
                          <span className="text-xs font-medium ml-1 text-gray-600">kWh/m²·yr</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!selectedAltResults.energy_breakdown && (
                    <p className="mt-4 text-sm font-medium text-gray-600 border-l-4 border-blue-600 bg-blue-50 pl-4 py-2">
                      Backend에서 energy_breakdown 데이터를 제공하면 자동으로 표시됩니다.
                    </p>
                  )}
                </div>

                {/* 입력 데이터 */}
                <div className="border-2 border-gray-200 p-6 bg-gray-50">
                  <h3 className="text-xl font-black text-black mb-4 pb-3 border-b-2 border-gray-200">
                    입력 데이터
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">건물 용도</p>
                      <p className="text-base font-semibold text-black">{project.building_type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">연면적</p>
                      <p className="text-base font-semibold text-black">{project.area?.toLocaleString()} m²</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">위치</p>
                      <p className="text-base font-semibold text-black">{project.location}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-gray-500 mb-2">신재생에너지</p>
                      <div className="space-y-1">
                        {selectedAltResults.input_data?.pv_capacity > 0 && (
                          <p className="text-sm font-semibold text-black">
                            • 태양광: {selectedAltResults.input_data.pv_capacity} kWp
                          </p>
                        )}
                        {selectedAltResults.input_data?.geothermal_capacity > 0 && (
                          <p className="text-sm font-semibold text-black">
                            • 지열: {selectedAltResults.input_data.geothermal_capacity} kW
                          </p>
                        )}
                        {selectedAltResults.input_data?.ess_capacity > 0 && (
                          <p className="text-sm font-semibold text-black">
                            • ESS: {selectedAltResults.input_data.ess_capacity} kWh
                          </p>
                        )}
                        {!selectedAltResults.input_data?.pv_capacity && (
                          <p className="text-sm text-gray-500">없음</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 월별 에너지 데이터 차트 */}
                {selectedAltResults.monthly_data && selectedAltResults.monthly_data.length > 0 && (
                  <div className="border-2 border-gray-200 p-6">
                    <MonthlyEnergyChart
                      data={selectedAltResults.monthly_data}
                      area={project.area}
                      title={`${selectedAltResults.alt_name} - 월별 에너지 분석`}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="w-full border-2 border-black bg-black text-white px-6 py-3 text-sm font-bold hover:bg-gray-900 transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* 편집/복사 모달 */}
      {showEditModal && editingAlt && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-black">
                  {editingAlt.id ? `${editingAlt.alt_name} 편집` : `${editingAlt.alt_name}`}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingAlt(null)
                  }}
                  className="text-gray-400 hover:text-black font-bold text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <AlternativeInputForm
                project={project}
                editingData={editingAlt}
                onSave={() => {
                  setShowEditModal(false)
                  setEditingAlt(null)
                  loadProjectData()
                }}
                onCancel={() => {
                  setShowEditModal(false)
                  setEditingAlt(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
      <ScrollToTop />
    </>
  )
}

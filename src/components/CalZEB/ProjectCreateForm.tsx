// ProjectCreateForm v3.1 - 형상 정보 추가
// Design: LESS IS MORE Minimalism
// Features: 기본 정보 + 형상 정보 (펼치기/접기) + 면적 미리보기

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProjectCreateFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ProjectCreateForm({ onClose, onSuccess }: ProjectCreateFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShapeSection, setShowShapeSection] = useState(false)

  // 기본 정보
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    building_type: 'office',
    area: '',
    location: 'seoul'
  })

  // 형상 정보 (선택)
  const [shapeData, setShapeData] = useState({
    wall_S: '',
    wall_N: '',
    wall_E: '',
    wall_W: '',
    wall_NE: '',
    wall_SE: '',
    wall_SW: '',
    wall_NW: '',
    floors: '',
    floor_height: '3.0'
  })

  // 면적 자동 계산
  interface CalculatedAreas {
    walls: Record<string, number>
    roof: number
    floor: number
  }
  const [calculatedAreas, setCalculatedAreas] = useState<CalculatedAreas | null>(null)

  // calculateAreas with useCallback
  const calculateAreas = useCallback(() => {
    const floors = parseInt(shapeData.floors) || 0
    const floorHeight = parseFloat(shapeData.floor_height) || 0

    if (floors <= 0 || floorHeight <= 0) {
      setCalculatedAreas(null)
      return
    }

    const totalHeight = floors * floorHeight
    const areas: { walls: Record<string, number>; roof: number; floor: number } = { walls: {}, roof: 0, floor: 0 }

    // 방위별 벽면적
    const orientations = ['S', 'N', 'E', 'W', 'NE', 'SE', 'SW', 'NW']
    orientations.forEach(dir => {
      const length = parseFloat((shapeData as Record<string, string>)[`wall_${dir}`]) || 0
      if (length > 0) {
        areas.walls[dir] = length * totalHeight
      }
    })

    // 지붕/바닥 (연면적 / 층수)
    const area = parseFloat(formData.area) || 0
    areas.roof = area > 0 && floors > 0 ? area / floors : 0
    areas.floor = areas.roof

    setCalculatedAreas(areas)
  }, [shapeData, formData.area])

  useEffect(() => {
    if (showShapeSection && shapeData.floors && shapeData.floor_height) {
      calculateAreas()
    }
  }, [showShapeSection, shapeData.floors, shapeData.floor_height, calculateAreas])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.askwhy.works'
      const token = localStorage.getItem('access_token')

      // 기본 데이터
      interface ProjectCreateData {
        name: string
        description?: string
        tags?: string[]
        building_type: string
        area: number
        location: string
        shape_data?: {
          wall_lengths: Record<string, number>
          floors: number
          floor_height: number
        }
      }

      const data: ProjectCreateData = {
        name: formData.name,
        description: formData.description || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
        building_type: formData.building_type,
        area: parseFloat(formData.area),
        location: formData.location
      }

      // 형상 정보 (입력된 경우만)
      if (showShapeSection && shapeData.floors && shapeData.floor_height) {
        const wall_lengths: Record<string, number> = {}
        const orientations = ['S', 'N', 'E', 'W', 'NE', 'SE', 'SW', 'NW']
        orientations.forEach(dir => {
          const length = parseFloat((shapeData as Record<string, string>)[`wall_${dir}`])
          if (length > 0) {
            wall_lengths[dir] = length
          }
        })

        if (Object.keys(wall_lengths).length > 0) {
          data.shape_data = {
            wall_lengths,
            floors: parseInt(shapeData.floors),
            floor_height: parseFloat(shapeData.floor_height)
          }
        }
      }

      const response = await fetch(`${API_URL}/calzeb/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (response.status === 401) {
        throw new Error('로그인이 필요합니다')
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '프로젝트 생성 실패')
      }

      onSuccess()
      onClose()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('알 수 없는 오류가 발생했습니다')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-black max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="border-b-2 border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-black">
                새 프로젝트 생성 (v3.1)
              </h2>
              <p className="text-sm font-medium text-gray-600 mt-1">
                기본 정보 + 형상 정보 (선택)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black transition-colors duration-150 font-bold text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Tier 1: 기본 정보 */}
          <div className="border-2 border-gray-200 p-6 space-y-6">
            <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3">
              <p className="text-base font-bold text-black">
                Tier 1: 기본 정보 (필수)
              </p>
            </div>

            {/* 프로젝트 이름 */}
            <div>
              <label className="block text-sm font-bold text-black mb-3">
                프로젝트 이름 <span className="text-red-600 font-black">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 강남 오피스빌딩 ZEB 검토"
                required
                className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 transition-all duration-150"
              />
            </div>

            {/* 건물 용도 */}
            <div>
              <label className="block text-sm font-bold text-black mb-3">
                건물 용도 <span className="text-red-600 font-black">*</span>
              </label>
              <select
                value={formData.building_type}
                onChange={(e) => setFormData({ ...formData, building_type: e.target.value })}
                required
                className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black focus:outline-none focus:border-red-600 transition-all duration-150"
              >
                <option value="office">업무시설 (Office)</option>
                <option value="residential">주거시설 (Residential)</option>
                <option value="educational">교육시설 (Educational)</option>
                <option value="retail">판매시설 (Retail)</option>
                <option value="hotel">숙박시설 (Hotel)</option>
              </select>
            </div>

            {/* 연면적 */}
            <div>
              <label className="block text-sm font-bold text-black mb-3">
                연면적 <span className="text-red-600 font-black">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="5000"
                  min="10"
                  max="1000000"
                  step="1"
                  required
                  className="flex-1 border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 focus:outline-none focus:border-red-600 transition-all duration-150"
                />
                <span className="text-base font-bold text-black">m²</span>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-2">
                범위: 10 ~ 1,000,000 m²
              </p>
            </div>

            {/* 위치 */}
            <div>
              <label className="block text-sm font-bold text-black mb-3">
                위치 <span className="text-red-600 font-black">*</span>
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black focus:outline-none focus:border-red-600 transition-all duration-150"
              >
                <option value="seoul">서울</option>
                <option value="busan">부산</option>
                <option value="daegu">대구</option>
                <option value="incheon">인천</option>
                <option value="gwangju">광주</option>
                <option value="daejeon">대전</option>
                <option value="ulsan">울산</option>
                <option value="gangneung">강릉</option>
                <option value="jeju">제주</option>
              </select>
            </div>

            {/* 설명 (선택) */}
            <div>
              <label className="block text-sm font-bold text-black mb-3">
                설명 (선택)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="예: 5,000m² 업무시설, ZEB 2등급 목표"
                rows={2}
                className="w-full border-2 border-gray-300 px-4 py-3 text-base font-normal text-black placeholder:text-gray-400 focus:outline-none focus:border-red-600 transition-all duration-150"
              />
            </div>
          </div>

          {/* v3.1: 형상 정보 (선택) */}
          <div className="border-2 border-gray-200 p-6">
            <button
              type="button"
              onClick={() => setShowShapeSection(!showShapeSection)}
              className="w-full flex items-center justify-between border-l-4 border-blue-600 pl-4 bg-blue-50/50 py-3 hover:bg-blue-50 transition-colors duration-150"
            >
              <div className="text-left">
                <p className="text-base font-bold text-black">
                  형상 정보 (선택) - 상세 부하계산용
                </p>
                <p className="text-xs font-medium text-gray-600 mt-1">
                  {showShapeSection ? '입력하면 외피 면적 자동 계산됩니다' : '건너뛰면 원단위 기반 계산만 가능'}
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {showShapeSection ? '−' : '+'}
              </span>
            </button>

            <AnimatePresence>
              {showShapeSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 space-y-6">
                    {/* 방위별 직선길이 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-3">
                        방위별 외벽 직선길이
                      </label>
                      <p className="text-xs font-medium text-gray-600 mb-4">
                        평면도 둘레를 방위별로 입력하세요. 최소 1개 이상 입력하면 면적이 자동 계산됩니다.
                      </p>

                      {/* 주요 4방위 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-bold text-black mb-2">남향 (S)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={shapeData.wall_S}
                              onChange={(e) => setShapeData({ ...shapeData, wall_S: e.target.value })}
                              placeholder="50"
                              min="0"
                              step="0.1"
                              className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600"
                            />
                            <span className="text-xs font-bold">m</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-black mb-2">북향 (N)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={shapeData.wall_N}
                              onChange={(e) => setShapeData({ ...shapeData, wall_N: e.target.value })}
                              placeholder="50"
                              min="0"
                              step="0.1"
                              className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600"
                            />
                            <span className="text-xs font-bold">m</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-black mb-2">동향 (E)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={shapeData.wall_E}
                              onChange={(e) => setShapeData({ ...shapeData, wall_E: e.target.value })}
                              placeholder="20"
                              min="0"
                              step="0.1"
                              className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600"
                            />
                            <span className="text-xs font-bold">m</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-black mb-2">서향 (W)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={shapeData.wall_W}
                              onChange={(e) => setShapeData({ ...shapeData, wall_W: e.target.value })}
                              placeholder="20"
                              min="0"
                              step="0.1"
                              className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600"
                            />
                            <span className="text-xs font-bold">m</span>
                          </div>
                        </div>
                      </div>

                      {/* 대각 방향 (선택) */}
                      <details className="border border-gray-200 p-4">
                        <summary className="text-xs font-bold text-gray-700 cursor-pointer hover:text-black">
                          대각 방향 추가 (NE, SE, SW, NW)
                        </summary>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {['NE', 'SE', 'SW', 'NW'].map(dir => (
                            <div key={dir}>
                              <label className="block text-xs font-bold text-black mb-2">{dir}</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={(shapeData as Record<string, string>)[`wall_${dir}`]}
                                  onChange={(e) => setShapeData({ ...shapeData, [`wall_${dir}`]: e.target.value })}
                                  placeholder="0"
                                  min="0"
                                  step="0.1"
                                  className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600"
                                />
                                <span className="text-xs font-bold">m</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>

                    {/* 층 정보 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-black mb-3">
                          층수 <span className="text-blue-600">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={shapeData.floors}
                            onChange={(e) => setShapeData({ ...shapeData, floors: e.target.value })}
                            placeholder="5"
                            min="1"
                            max="100"
                            step="1"
                            className="flex-1 border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-blue-600"
                          />
                          <span className="text-base font-bold text-black">층</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-black mb-3">
                          층고 <span className="text-blue-600">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={shapeData.floor_height}
                            onChange={(e) => setShapeData({ ...shapeData, floor_height: e.target.value })}
                            placeholder="3.0"
                            min="2.0"
                            max="10.0"
                            step="0.1"
                            className="flex-1 border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-blue-600"
                          />
                          <span className="text-base font-bold text-black">m</span>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mt-2">
                          권장: 업무 3.0m, 주거 2.3m
                        </p>
                      </div>
                    </div>

                    {/* 면적 미리보기 */}
                    {calculatedAreas && calculatedAreas.walls && Object.keys(calculatedAreas.walls).length > 0 && (
                      <div className="border-2 border-blue-600 bg-blue-50 p-4">
                        <h4 className="text-sm font-bold text-black mb-3">
                          자동 계산된 면적
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {Object.entries(calculatedAreas.walls).map(([dir, area]) => (
                            <div key={dir} className="border-l-2 border-blue-600 pl-2">
                              <span className="font-bold text-black">{dir}</span>:
                              <span className="ml-2 font-semibold text-blue-900">{area.toFixed(1)} m²</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-blue-200">
                          <div className="border-l-2 border-blue-600 pl-2">
                            <span className="font-bold text-black">지붕</span>:
                            <span className="ml-2 font-semibold text-blue-900">{calculatedAreas.roof.toFixed(1)} m²</span>
                          </div>
                          <div className="border-l-2 border-blue-600 pl-2">
                            <span className="font-bold text-black">바닥</span>:
                            <span className="ml-2 font-semibold text-blue-900">{calculatedAreas.floor.toFixed(1)} m²</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-blue-900 mt-3 pt-3 border-t border-blue-200">
                          이 면적이 모든 Alternative에 기본값으로 적용됩니다
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          {error && (
            <div className="border-l-4 border-red-600 bg-red-50 pl-4 py-4">
              <p className="text-base font-bold text-red-600 mb-2">오류</p>
              <p className="text-sm font-medium text-gray-700">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-gray-300 px-6 py-3 text-sm font-bold text-black hover:border-black transition-colors duration-150"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="border-2 border-red-600 bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '생성 중...' : '프로젝트 생성'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

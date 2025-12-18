// AlternativeForm - Alternative 입력 폼 (간편/상세 모드)
// Design: 블랙 볼드체 + 최고 수준의 입력 UX
// Based on: 19_프로젝트_공통정보_설계.md

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AlternativeFormProps {
  projectId: number
  projectData: {
    building_type: string
    area: number
    location: string
  }
  mode: 'simple' | 'detailed'  // 프로젝트 설정에 따라 자동 결정
  editMode?: boolean  // 편집 모드 여부
  existingData?: any  // 기존 데이터 (편집 시)
  onClose: () => void
  onSuccess: () => void
}

export default function AlternativeForm({ projectId, projectData, mode, editMode = false, existingData, onClose, onSuccess }: AlternativeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState(0)  // 0: 기본, 1: 신재생

  // 기존 데이터가 있으면 해당 데이터로 초기화
  const initializeFormData = () => {
    if (editMode && existingData) {
      // 기존 데이터에서 input_data 파싱
      const inputData = typeof existingData.input_data === 'string'
        ? JSON.parse(existingData.input_data)
        : existingData.input_data || {}

      return {
        alt_name: existingData.alt_name || '',
        description: existingData.description || '',
        pv_rooftop_capacity: inputData.pv_capacity?.toString() || '',
        pv_rooftop_tilt: '30',
        pv_rooftop_azimuth: '180',
        pv_rooftop_bifacial: false,
        pv_bipv_area: '',
        pv_bipv_orientation: 'S',
        solar_thermal_area: inputData.solar_thermal_area?.toString() || '',
        geothermal_capacity: inputData.geothermal_capacity?.toString() || '',
        fuel_cell_capacity: '',
        fuel_cell_type: 'PEMFC',
        ess_capacity: '',
        ess_efficiency: '0.90',
        water_source_capacity: '',
        u_roof_override: '',
        u_wall_override: '',
        u_window_override: '',
        wwr_override: '',
        shgc_override: '',
        heating_efficiency_override: '',
        cooling_cop_override: '',
        lighting_density_override: ''
      }
    }

    return {
      // Tier 1: 기본
      alt_name: '',
      description: '',

      // Tier 2: 신재생 (간편 모드에서 사용)
      pv_rooftop_capacity: '',
      pv_rooftop_tilt: '30',  // 기본값
      pv_rooftop_azimuth: '180',  // 남향
      pv_rooftop_bifacial: false,
      pv_bipv_area: '',
      pv_bipv_orientation: 'S',
      solar_thermal_area: '',
      geothermal_capacity: '',
      fuel_cell_capacity: '',
      fuel_cell_type: 'PEMFC',
      ess_capacity: '',
      ess_efficiency: '0.90',  // 기본값
      water_source_capacity: '',

      // Tier 3: 외피/시스템 override (상세 모드에서만 사용)
      u_roof_override: '',
      u_wall_override: '',
      u_window_override: '',
      wwr_override: '',
      shgc_override: '',
      heating_efficiency_override: '',
      cooling_cop_override: '',
      lighting_density_override: ''
    }
  }

  // 기본 정보
  const [formData, setFormData] = useState(initializeFormData())

  const tabs = mode === 'simple'
    ? ['기본 정보', '신재생에너지']
    : ['기본 정보', '신재생에너지', '외피 Override', '시스템 Override']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

      // Backend 형식에 맞게 데이터 구성 (확장)
      const requestData = {
        alt_name: formData.alt_name || 'Alternative 1',
        description: formData.description || '',
        building_data: {
          // 기본 정보
          building_type: projectData.building_type,
          area: projectData.area,
          location: projectData.location,

          // 태양광 (확장)
          pv_capacity: parseFloat(formData.pv_rooftop_capacity) || 0,
          pv_tilt: parseFloat(formData.pv_rooftop_tilt) || 30,
          pv_azimuth: parseFloat(formData.pv_rooftop_azimuth) || 180,
          pv_bifacial: formData.pv_rooftop_bifacial || false,

          // 기타 신재생
          solar_thermal_area: parseFloat(formData.solar_thermal_area) || 0,
          geothermal_capacity: parseFloat(formData.geothermal_capacity) || 0,
          fuel_cell_capacity: parseFloat(formData.fuel_cell_capacity) || 0,
          ess_capacity: parseFloat(formData.ess_capacity) || 0,
          water_source_capacity: parseFloat(formData.water_source_capacity) || 0
        }
      }

      console.log('[AlternativeForm] 전송 데이터:', requestData)

      // API 호출 - 편집 모드면 PUT, 아니면 POST
      const url = editMode && existingData
        ? `${API_URL}/calzeb/projects/${projectId}/alternatives/${existingData.id}`
        : `${API_URL}/calzeb/projects/${projectId}/alternatives`

      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      console.log('[AlternativeForm] 응답 상태:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[AlternativeForm] 에러 응답:', errorData)

        // Pydantic 유효성 검증 에러 상세 출력
        if (Array.isArray(errorData.detail)) {
          console.error('[AlternativeForm] 유효성 검증 에러:', errorData.detail)
          const errorMessages = errorData.detail.map((err: any) =>
            `${err.loc.join('.')}: ${err.msg}`
          ).join(', ')
          throw new Error(`유효성 검증 실패: ${errorMessages}`)
        }

        throw new Error(errorData.detail || 'Alternative 생성 실패')
      }

      const result = await response.json()
      console.log('[AlternativeForm] 성공:', result)

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-black max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="border-b-4 border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-black text-black mb-2">
                {editMode ? 'Alternative 편집' : 'Alternative 추가'}
              </h2>
              <p className="text-sm font-semibold text-gray-600">
                {mode === 'simple' ? '간편 모드 (신재생만)' : '상세 모드 (외피 + 신재생)'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black transition-colors duration-150 font-black text-3xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-2 mt-6">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentTab(idx)}
                className={`
                  px-4 py-2 text-sm font-bold transition-all duration-150
                  ${currentTab === idx
                    ? 'border-b-4 border-red-600 text-black'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-black'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          <AnimatePresence mode="wait">
            {/* Tab 0: 기본 정보 */}
            {currentTab === 0 && (
              <motion.div
                key="tab-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3 mb-8">
                  <p className="text-base font-bold text-black">
                    Alternative 기본 정보
                  </p>
                </div>

                {/* Alternative 이름 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <label className="block text-base font-black text-black mb-3">
                    Alternative 이름 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.alt_name}
                    onChange={(e) => setFormData({ ...formData, alt_name: e.target.value })}
                    placeholder="예: Base Case - 최소 법규"
                    required
                    className="w-full border-2 border-gray-300 px-5 py-4 text-lg font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                  />
                  <p className="mt-2 text-xs font-medium text-gray-600">
                    명확하고 구분되는 이름을 입력하세요 (예: Alt-01: 태양광 5kWp, Alt-02: 태양광 10kWp)
                  </p>
                </div>

                {/* 설명 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <label className="block text-base font-black text-black mb-3">
                    설명 (선택)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="예: 지붕형 태양광 5kWp 설치, 경사각 30도, 남향"
                    rows={4}
                    className="w-full border-2 border-gray-300 px-5 py-4 text-base font-medium text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150 resize-none"
                  />
                  <p className="mt-2 text-xs font-medium text-gray-600">
                    이 Alternative의 주요 특징이나 설계 의도를 간단히 설명하세요
                  </p>
                </div>
              </motion.div>
            )}

            {/* Tab 1: 신재생에너지 */}
            {currentTab === 1 && (
              <motion.div
                key="tab-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3 mb-8">
                  <p className="text-base font-bold text-black">
                    신재생에너지 시스템 (모두 선택 사항)
                  </p>
                </div>

                {/* 태양광 (지붕형) */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4 pb-3 border-b-2 border-gray-200">
                    태양광 (지붕형 PV)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        설치 용량 (kWp)
                      </label>
                      <input
                        type="number"
                        value={formData.pv_rooftop_capacity}
                        onChange={(e) => setFormData({ ...formData, pv_rooftop_capacity: e.target.value })}
                        placeholder="예: 50"
                        step="0.1"
                        min="0"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        경사각 (도)
                      </label>
                      <input
                        type="number"
                        value={formData.pv_rooftop_tilt}
                        onChange={(e) => setFormData({ ...formData, pv_rooftop_tilt: e.target.value })}
                        placeholder="30"
                        step="1"
                        min="0"
                        max="90"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        방위각 (도)
                      </label>
                      <select
                        value={formData.pv_rooftop_azimuth}
                        onChange={(e) => setFormData({ ...formData, pv_rooftop_azimuth: e.target.value })}
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150 cursor-pointer"
                      >
                        <option value="0">북향 (0°)</option>
                        <option value="90">동향 (90°)</option>
                        <option value="180">남향 (180°) - 권장</option>
                        <option value="270">서향 (270°)</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.pv_rooftop_bifacial}
                          onChange={(e) => setFormData({ ...formData, pv_rooftop_bifacial: e.target.checked })}
                          className="w-5 h-5 border-2 border-gray-300 text-red-600 focus:ring-red-600 focus:ring-2"
                        />
                        <span className="text-sm font-bold text-black">양면형 모듈</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* BIPV */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4 pb-3 border-b-2 border-gray-200">
                    BIPV (건물일체형 태양광)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        설치 면적 (m²)
                      </label>
                      <input
                        type="number"
                        value={formData.pv_bipv_area}
                        onChange={(e) => setFormData({ ...formData, pv_bipv_area: e.target.value })}
                        placeholder="예: 200"
                        step="0.1"
                        min="0"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        설치 방위
                      </label>
                      <select
                        value={formData.pv_bipv_orientation}
                        onChange={(e) => setFormData({ ...formData, pv_bipv_orientation: e.target.value })}
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150 cursor-pointer"
                      >
                        <option value="S">남향 (S)</option>
                        <option value="SE">남동향 (SE)</option>
                        <option value="SW">남서향 (SW)</option>
                        <option value="E">동향 (E)</option>
                        <option value="W">서향 (W)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 기타 신재생 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4 pb-3 border-b-2 border-gray-200">
                    기타 신재생에너지
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 태양열 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        태양열 집열 면적 (m²)
                      </label>
                      <input
                        type="number"
                        value={formData.solar_thermal_area}
                        onChange={(e) => setFormData({ ...formData, solar_thermal_area: e.target.value })}
                        placeholder="예: 50"
                        step="0.1"
                        min="0"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* 지열 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        지열 용량 (kW)
                      </label>
                      <input
                        type="number"
                        value={formData.geothermal_capacity}
                        onChange={(e) => setFormData({ ...formData, geothermal_capacity: e.target.value })}
                        placeholder="예: 100"
                        step="0.1"
                        min="0"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* 연료전지 용량 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        연료전지 용량 (kW)
                      </label>
                      <input
                        type="number"
                        value={formData.fuel_cell_capacity}
                        onChange={(e) => setFormData({ ...formData, fuel_cell_capacity: e.target.value })}
                        placeholder="예: 50"
                        step="0.1"
                        min="0"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* 연료전지 유형 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        연료전지 유형
                      </label>
                      <select
                        value={formData.fuel_cell_type}
                        onChange={(e) => setFormData({ ...formData, fuel_cell_type: e.target.value })}
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150 cursor-pointer"
                      >
                        <option value="PEMFC">PEMFC (고분자전해질)</option>
                        <option value="SOFC">SOFC (고체산화물)</option>
                      </select>
                    </div>

                    {/* ESS 용량 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        ESS 용량 (kWh)
                      </label>
                      <input
                        type="number"
                        value={formData.ess_capacity}
                        onChange={(e) => setFormData({ ...formData, ess_capacity: e.target.value })}
                        placeholder="예: 100"
                        step="0.1"
                        min="0"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* ESS 효율 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        ESS 효율 (0.80~0.95)
                      </label>
                      <input
                        type="number"
                        value={formData.ess_efficiency}
                        onChange={(e) => setFormData({ ...formData, ess_efficiency: e.target.value })}
                        placeholder="0.90"
                        step="0.01"
                        min="0.70"
                        max="0.99"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* 수열 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-black mb-2">
                        수열 용량 (kW)
                      </label>
                      <input
                        type="number"
                        value={formData.water_source_capacity}
                        onChange={(e) => setFormData({ ...formData, water_source_capacity: e.target.value })}
                        placeholder="예: 30"
                        step="0.1"
                        min="0"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>
                  </div>
                </div>

                {/* 도움말 */}
                <div className="bg-blue-50 border-2 border-blue-200 p-4">
                  <p className="text-sm font-bold text-blue-900 mb-2">
                    입력 가이드
                  </p>
                  <ul className="text-sm font-medium text-blue-800 space-y-1">
                    <li>• 신재생에너지를 사용하지 않으면 빈칸으로 두세요</li>
                    <li>• 여러 신재생을 조합할 수 있습니다 (태양광 + 지열 + ESS)</li>
                    <li>• 용량은 피크 출력 기준입니다</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Tab 2: 외피 Override (상세 모드만) */}
            {currentTab === 2 && mode === 'detailed' && (
              <motion.div
                key="tab-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3 mb-8">
                  <p className="text-base font-bold text-black">
                    외피 성능 Override (프로젝트 기본값을 덮어씁니다)
                  </p>
                </div>

                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 지붕 U-value */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        지붕 열관류율 (W/m²·K)
                      </label>
                      <input
                        type="number"
                        value={formData.u_roof_override}
                        onChange={(e) => setFormData({ ...formData, u_roof_override: e.target.value })}
                        placeholder="예: 0.15"
                        step="0.01"
                        min="0"
                        max="5"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* 외벽 U-value */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        외벽 열관류율 (W/m²·K)
                      </label>
                      <input
                        type="number"
                        value={formData.u_wall_override}
                        onChange={(e) => setFormData({ ...formData, u_wall_override: e.target.value })}
                        placeholder="예: 0.20"
                        step="0.01"
                        min="0"
                        max="5"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* 창호 U-value */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        창호 열관류율 (W/m²·K)
                      </label>
                      <input
                        type="number"
                        value={formData.u_window_override}
                        onChange={(e) => setFormData({ ...formData, u_window_override: e.target.value })}
                        placeholder="예: 1.2"
                        step="0.1"
                        min="0"
                        max="10"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* WWR */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        창문 면적비 (WWR)
                      </label>
                      <input
                        type="number"
                        value={formData.wwr_override}
                        onChange={(e) => setFormData({ ...formData, wwr_override: e.target.value })}
                        placeholder="예: 0.40"
                        step="0.01"
                        min="0"
                        max="1"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* SHGC */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-black mb-2">
                        차폐계수 (SHGC, 0~1)
                      </label>
                      <input
                        type="number"
                        value={formData.shgc_override}
                        onChange={(e) => setFormData({ ...formData, shgc_override: e.target.value })}
                        placeholder="예: 0.35"
                        step="0.01"
                        min="0"
                        max="1"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: 시스템 Override (상세 모드만) */}
            {currentTab === 3 && mode === 'detailed' && (
              <motion.div
                key="tab-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3 mb-8">
                  <p className="text-base font-bold text-black">
                    HVAC/조명 시스템 Override
                  </p>
                </div>

                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 난방 효율 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        난방 효율
                      </label>
                      <input
                        type="number"
                        value={formData.heating_efficiency_override}
                        onChange={(e) => setFormData({ ...formData, heating_efficiency_override: e.target.value })}
                        placeholder="예: 0.95"
                        step="0.01"
                        min="0"
                        max="1.5"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* 냉방 COP */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        냉방 COP
                      </label>
                      <input
                        type="number"
                        value={formData.cooling_cop_override}
                        onChange={(e) => setFormData({ ...formData, cooling_cop_override: e.target.value })}
                        placeholder="예: 4.5"
                        step="0.1"
                        min="0"
                        max="10"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>

                    {/* 조명 밀도 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-black mb-2">
                        조명 밀도 (W/m²)
                      </label>
                      <input
                        type="number"
                        value={formData.lighting_density_override}
                        onChange={(e) => setFormData({ ...formData, lighting_density_override: e.target.value })}
                        placeholder="예: 8"
                        step="0.1"
                        min="0"
                        max="50"
                        className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                      />
                    </div>
                  </div>
                </div>

                {/* 도움말 */}
                <div className="bg-blue-50 border-2 border-blue-200 p-4">
                  <p className="text-sm font-bold text-blue-900 mb-2">
                    Override 안내
                  </p>
                  <ul className="text-sm font-medium text-blue-800 space-y-1">
                    <li>• 입력하면 프로젝트 기본값을 덮어씁니다</li>
                    <li>• 빈칸이면 프로젝트 기본값 사용</li>
                    <li>• Alternative별로 다른 시스템을 비교할 때 유용합니다</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 에러 메시지 */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 border-l-4 border-red-600 bg-red-50 pl-4 py-3"
            >
              <p className="text-base font-bold text-red-600">{error}</p>
            </motion.div>
          )}

          {/* 버튼 영역 */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-200">
            {/* 탭 네비게이션 버튼 */}
            <div className="flex gap-2">
              {currentTab > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentTab(currentTab - 1)}
                  className="border-2 border-gray-300 px-6 py-3 text-sm font-bold text-black hover:border-black transition-colors duration-150"
                >
                  ← 이전
                </button>
              )}
            </div>

            {/* 완료/다음 버튼 */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="border-2 border-gray-300 px-6 py-3 text-sm font-bold text-gray-700 hover:border-black hover:text-black transition-colors duration-150"
              >
                취소
              </button>

              {currentTab < tabs.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentTab(currentTab + 1)}
                  className="border-2 border-black bg-black text-white px-8 py-3 text-sm font-bold hover:bg-gray-900 transition-colors duration-150"
                >
                  다음 →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="border-2 border-red-600 bg-red-600 text-white px-8 py-3 text-sm font-bold hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (editMode ? '수정 중...' : '생성 중...') : (editMode ? 'Alternative 수정하기' : 'Alternative 추가하기')}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

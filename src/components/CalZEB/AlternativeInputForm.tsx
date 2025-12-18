// AlternativeInputForm v3.1 - 5-Tab 웹 입력 폼
// Design: LESS IS MORE Minimalism
// Features: 프로젝트 면적 자동 적용 + Alternative 성능 입력

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AlternativeInputFormProps {
  project: any  // 프로젝트 정보 (면적 자동 적용용)
  editingData?: any  // 편집할 Alternative 데이터 (선택)
  onSave: () => void
  onCancel: () => void
}

export default function AlternativeInputForm({ project, editingData, onSave, onCancel }: AlternativeInputFormProps) {
  const [activeTab, setActiveTab] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Tab 1: 기본 정보
  const [basicData, setBasicData] = useState({
    alt_name: '',
    description: ''
  })

  // editingData가 있으면 폼에 데이터 채우기
  useEffect(() => {
    if (editingData) {
      // input_data 파싱
      const inputData = typeof editingData.input_data === 'string'
        ? JSON.parse(editingData.input_data)
        : editingData.input_data || {}

      console.log('[AlternativeForm] editingData 로드:', inputData)

      // 기본 정보 설정
      setBasicData({
        alt_name: editingData.alt_name || '',
        description: editingData.description || ''
      })

      // 외피 데이터 로드
      if (inputData.envelope) {
        setEnvelopeData(inputData.envelope)
      }

      // HVAC 데이터 로드
      if (inputData.hvac) {
        setHvacData(inputData.hvac)
      }

      // 조명 데이터 로드
      if (inputData.lighting) {
        setLightingData(inputData.lighting)
      }

      // 신재생 데이터 설정 (모든 Phase 포함!)
      setRenewableData(prev => ({
        ...prev,
        // 기본
        pv_rooftop_capacity: inputData.pv_capacity?.toString() || '',
        pv_tilt: inputData.pv_tilt?.toString() || '30',
        pv_azimuth: inputData.pv_azimuth?.toString() || '180',
        pv_bifacial: inputData.pv_bifacial ? 'true' : 'false',
        // 고급
        pv_module_type: inputData.pv_module_type || 'monocrystalline',
        pv_temp_coeff: inputData.pv_temp_coeff?.toString() || '-0.004',
        pv_shading_loss: inputData.pv_shading_loss?.toString() || '5',
        pv_inverter_efficiency: inputData.pv_inverter_efficiency?.toString() || '97',
        pv_albedo: inputData.pv_albedo?.toString() || '0.2',
        pv_tracking: inputData.pv_tracking || 'fixed',
        // Phase 1-6
        pv_modules_per_string: inputData.pv_modules_per_string?.toString() || '10',
        pv_strings_per_inverter: inputData.pv_strings_per_inverter?.toString() || '2',
        pv_dc_ac_ratio: inputData.pv_dc_ac_ratio?.toString() || '1.2',
        pv_module_pmax: inputData.pv_module_pmax?.toString() || '400',
        pv_soiling_loss: inputData.pv_soiling_loss?.toString() || '3',
        pv_snow_loss: inputData.pv_snow_loss?.toString() || '1',
        pv_cable_loss: inputData.pv_cable_loss?.toString() || '2',
        pv_mismatch_loss: inputData.pv_mismatch_loss?.toString() || '1',
        pv_near_shading_loss: inputData.pv_near_shading_loss?.toString() || '3',
        pv_horizon_shading_loss: inputData.pv_horizon_shading_loss?.toString() || '2',
        pv_iam_model: inputData.pv_iam_model || 'ashrae',
        pv_optimize_tilt: inputData.pv_optimize_tilt ? 'true' : 'false',
        // 기타
        ess_capacity: inputData.ess_capacity?.toString() || '',
        geothermal_capacity: inputData.geothermal_capacity?.toString() || ''
      }))
    }
  }, [editingData])

  // Tab 2: 외피 성능
  const [envelopeData, setEnvelopeData] = useState({
    // 지붕
    u_roof: '0.15',
    // 바닥
    u_floor: '0.20',
    // 기밀성
    airtightness: '3.0',
    // 방위별 (프로젝트 면적 사용, 성능만 입력)
    walls: {
      S: { u_wall: '0.24', u_window: '1.5', wwr: '40', shgc: '0.40' },
      N: { u_wall: '0.24', u_window: '1.5', wwr: '30', shgc: '0.40' },
      E: { u_wall: '0.24', u_window: '1.5', wwr: '30', shgc: '0.40' },
      W: { u_wall: '0.24', u_window: '1.5', wwr: '30', shgc: '0.40' }
    }
  })

  // Tab 3: HVAC
  const [hvacData, setHvacData] = useState({
    // 난방 열원
    heating_source: 'gas_boiler_condensing',
    heating_efficiency: '0.95',
    // 난방 공조 방식 (v3.1 추가)
    heating_distribution: 'floor_heating',  // 바닥난방, 라디에이터, AHU, FCU
    heating_setpoint: '20',

    // 냉방 열원
    cooling_source: 'vrf',
    cooling_cop: '3.8',
    // 냉방 공조 방식 (v3.1 추가)
    cooling_distribution: 'ceiling_cassette',  // 천정형, FCU, AHU, 벽걸이
    cooling_setpoint: '26',

    // 급탕 (v3.1 추가 - 중요!)
    hot_water_source: 'same_as_heating',  // 난방과 동일, 전용 보일러, 태양열+보조
    hot_water_temp: '55',  // 55-60°C
    hot_water_tank: 'true',  // 저장 탱크 여부
    hot_water_tank_volume: '500',  // L

    // 환기
    ventilation_type: 'mechanical',
    heat_recovery: 'true',
    heat_recovery_efficiency: '70'
  })

  // Tab 4: 조명
  const [lightingData, setLightingData] = useState({
    lighting_density: '10',  // W/m²
    lighting_type: 'led_high',
    daylight_control: 'false',
    occupancy_control: 'false',
    schedule_control: 'false'
  })

  // 상세 옵션 토글
  const [showPVAdvanced, setShowPVAdvanced] = useState(false)

  // Tab 5: 신재생
  const [renewableData, setRenewableData] = useState({
    // 태양광
    pv_rooftop_capacity: '',
    pv_tilt: '30',
    pv_azimuth: '180',
    pv_bifacial: 'false',
    // pvlib 고급 옵션
    pv_module_type: 'monocrystalline',
    pv_temp_coeff: '-0.004',
    pv_shading_loss: '5',
    pv_inverter_efficiency: '97',
    pv_albedo: '0.2',
    pv_tracking: 'fixed',
    // Phase 1: 시스템 구성
    pv_modules_per_string: '10',
    pv_strings_per_inverter: '2',
    pv_dc_ac_ratio: '1.2',
    pv_module_pmax: '400',
    // Phase 2: 손실
    pv_soiling_loss: '3',
    pv_snow_loss: '1',
    pv_cable_loss: '2',
    pv_mismatch_loss: '1',
    // Phase 3: 음영
    pv_near_shading_loss: '3',
    pv_horizon_shading_loss: '2',
    // Phase 4: IAM
    pv_iam_model: 'ashrae',
    // Phase 5-6
    pv_module_name: 'Generic_400W_Mono',
    pv_optimize_tilt: 'false',
    // BIPV
    pv_bipv_capacity: '',
    bipv_type: '',
    // ESS
    ess_capacity: '',
    ess_efficiency: '90',
    // 지열
    geothermal_capacity: '',
    geothermal_cop_heating: '4.2',
    geothermal_cop_cooling: '5.0',
    // 연료전지
    fuel_cell_capacity: '',
    fuel_cell_electric_eff: '40',
    fuel_cell_thermal_eff: '45',
    // 태양열
    solar_thermal_area: '',
    // 수열
    water_source_capacity: ''
  })

  const handleSubmit = async () => {
    console.log('[AlternativeForm] 저장 시작')
    console.log('[AlternativeForm] Project:', project)

    if (!basicData.alt_name) {
      setError('Alternative 이름을 입력하세요')
      setActiveTab(1)
      return
    }

    if (!project || !project.project_id) {
      setError('프로젝트 정보를 찾을 수 없습니다')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.askwhy.works'
      const token = localStorage.getItem('access_token')

      console.log('[AlternativeForm] API URL:', API_URL)
      console.log('[AlternativeForm] Token:', token ? '있음' : '없음')

      // Alternative 데이터 조합 (v3.1: envelope/hvac/lighting 포함)
      const altData = {
        alt_name: basicData.alt_name,
        description: basicData.description,

        // 프로젝트 기본 정보 + 신재생 (기존 형식 유지)
        building_data: {
          building_type: project.building_type,
          area: project.area,
          location: project.location,

          // 신재생 에너지 - 기본
          pv_capacity: parseFloat(renewableData.pv_rooftop_capacity) || 0,
          pv_tilt: parseFloat(renewableData.pv_tilt) || 30,
          pv_azimuth: parseFloat(renewableData.pv_azimuth) || 180,
          pv_bifacial: renewableData.pv_bifacial === 'true',

          // pvlib 고급 옵션
          pv_module_type: renewableData.pv_module_type || 'monocrystalline',
          pv_temp_coeff: parseFloat(renewableData.pv_temp_coeff) || -0.004,
          pv_shading_loss: parseFloat(renewableData.pv_shading_loss) || 5,
          pv_inverter_efficiency: parseFloat(renewableData.pv_inverter_efficiency) || 97,
          pv_albedo: parseFloat(renewableData.pv_albedo) || 0.2,
          pv_tracking: renewableData.pv_tracking || 'fixed',

          // Phase 1: 시스템 구성
          pv_modules_per_string: parseFloat(renewableData.pv_modules_per_string) || 10,
          pv_strings_per_inverter: parseFloat(renewableData.pv_strings_per_inverter) || 2,
          pv_dc_ac_ratio: parseFloat(renewableData.pv_dc_ac_ratio) || 1.2,
          pv_module_pmax: parseFloat(renewableData.pv_module_pmax) || 400,

          // Phase 2: 손실 분석
          pv_soiling_loss: parseFloat(renewableData.pv_soiling_loss) || 3,
          pv_snow_loss: parseFloat(renewableData.pv_snow_loss) || 1,
          pv_cable_loss: parseFloat(renewableData.pv_cable_loss) || 2,
          pv_mismatch_loss: parseFloat(renewableData.pv_mismatch_loss) || 1,

          // Phase 3: 음영
          pv_near_shading_loss: parseFloat(renewableData.pv_near_shading_loss) || 3,
          pv_horizon_shading_loss: parseFloat(renewableData.pv_horizon_shading_loss) || 2,

          // Phase 4: IAM
          pv_iam_model: renewableData.pv_iam_model || 'ashrae',

          // Phase 6: 최적화
          pv_optimize_tilt: renewableData.pv_optimize_tilt === 'true',

          // 기타 신재생
          ess_capacity: parseFloat(renewableData.ess_capacity) || 0,
          geothermal_capacity: parseFloat(renewableData.geothermal_capacity) || 0,
          fuel_cell_capacity: parseFloat(renewableData.fuel_cell_capacity) || 0,
          solar_thermal_area: parseFloat(renewableData.solar_thermal_area) || 0,
          water_source_capacity: parseFloat(renewableData.water_source_capacity) || 0,

          // v3.1: 상세 계산용 데이터 (input_data JSON에 함께 저장)
          envelope: envelopeData,
          hvac: hvacData,
          lighting: lightingData
        }
      }

      console.log('[AlternativeForm] 요청 데이터:', altData)

      // 편집 모드 구분
      const isEditMode = editingData && editingData.id
      const url = isEditMode
        ? `${API_URL}/calzeb/projects/${project.project_id}/alternatives/${editingData.id}`
        : `${API_URL}/calzeb/projects/${project.project_id}/alternatives`
      const method = isEditMode ? 'PUT' : 'POST'

      console.log('[AlternativeForm] 모드:', isEditMode ? '편집' : '신규')
      console.log('[AlternativeForm] URL:', url)
      console.log('[AlternativeForm] Method:', method)

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(altData)
      })

      console.log('[AlternativeForm] 응답 상태:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[AlternativeForm] 오류 응답:', errorData)
        throw new Error(errorData.detail || errorData.message || 'Alternative 추가 실패')
      }

      const result = await response.json()
      console.log('[AlternativeForm] 성공:', result)

      const zeb_grade = result.zeb_grade || result.results?.annual_summary?.zeb_grade || '미인증'
      const action = isEditMode ? '수정' : '추가'
      alert(`Alternative "${basicData.alt_name}" ${action} 완료!\nZEB ${zeb_grade}등급`)
      onSave()
    } catch (err: any) {
      console.error('[AlternativeForm] 오류:', err)
      setError(err.message)
      alert(`오류: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 1, label: '기본 정보', color: 'blue' },
    { id: 2, label: '외피 성능', color: 'green' },
    { id: 3, label: 'HVAC', color: 'orange' },
    { id: 4, label: '조명', color: 'yellow' },
    { id: 5, label: '신재생', color: 'red' }
  ]

  const getTabBorderColor = (color: string) => {
    const colors: any = {
      blue: 'border-blue-600',
      green: 'border-green-600',
      orange: 'border-orange-600',
      yellow: 'border-yellow-600',
      red: 'border-red-600'
    }
    return colors[color] || 'border-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-2 border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-4 text-sm font-bold transition-all duration-150 whitespace-nowrap
                ${activeTab === tab.id
                  ? `border-b-4 ${getTabBorderColor(tab.color)} text-black bg-gray-50`
                  : 'border-b-2 border-transparent text-gray-500 hover:text-black hover:bg-gray-50/50'
                }
              `}
            >
              {tab.id}. {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="border-2 border-gray-200 p-8 bg-white min-h-[500px]">
        {/* Tab 1: 기본 정보 */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4 bg-blue-50/50 py-3">
              <h3 className="text-xl font-black text-black">Tab 1: 기본 정보</h3>
              <p className="text-sm font-medium text-gray-700 mt-1">
                Alternative 이름과 설명을 입력하세요
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-3">
                Alternative 이름 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={basicData.alt_name}
                onChange={(e) => setBasicData({ ...basicData, alt_name: e.target.value })}
                placeholder="예: Alt 1 - PV 200kWp + 고단열 외벽"
                className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-3">
                설명 (선택)
              </label>
              <textarea
                value={basicData.description}
                onChange={(e) => setBasicData({ ...basicData, description: e.target.value })}
                placeholder="예: 태양광 200kWp 설치, 외벽 U-value 0.17로 강화"
                rows={3}
                className="w-full border-2 border-gray-300 px-4 py-3 text-base font-normal focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="border-2 border-blue-600 bg-blue-50 p-4">
              <h4 className="text-sm font-bold text-black mb-2">프로젝트 정보 (자동 적용)</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-bold text-black">건물 용도:</span>
                  <span className="ml-2 font-semibold text-blue-900">{project?.building_type}</span>
                </div>
                <div>
                  <span className="font-bold text-black">연면적:</span>
                  <span className="ml-2 font-semibold text-blue-900">{project?.area} m²</span>
                </div>
                <div>
                  <span className="font-bold text-black">위치:</span>
                  <span className="ml-2 font-semibold text-blue-900">{project?.location}</span>
                </div>
                {project?.shape_data && (
                  <div>
                    <span className="font-bold text-black">형상 정보:</span>
                    <span className="ml-2 font-semibold text-blue-900">입력됨 ✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 외피 성능 */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="border-l-4 border-green-600 pl-4 bg-green-50/50 py-3">
              <h3 className="text-xl font-black text-black">Tab 2: 외피 성능</h3>
              <p className="text-sm font-medium text-gray-700 mt-1">
                U-value와 WWR을 수정하세요. 면적은 프로젝트에서 자동 적용됩니다.
              </p>
            </div>

            {/* 프로젝트 면적 정보 표시 */}
            {project?.shape_data && (
              <div className="border-2 border-green-600 bg-green-50 p-4">
                <h4 className="text-sm font-bold text-black mb-3">프로젝트 기본 면적 (자동 적용)</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                  {/* TODO: 프로젝트 면적 데이터 표시 */}
                  <div className="border-l-2 border-green-600 pl-2">
                    <span className="font-bold">S</span>: <span className="font-semibold">750 m²</span>
                  </div>
                </div>
              </div>
            )}

            {/* 지붕/바닥 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-black mb-3">
                  지붕 U-value (W/m²K)
                </label>
                <input
                  type="number"
                  value={envelopeData.u_roof}
                  onChange={(e) => setEnvelopeData({ ...envelopeData, u_roof: e.target.value })}
                  step="0.01"
                  min="0.01"
                  max="1.0"
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-green-600"
                />
                <p className="text-xs font-medium text-gray-500 mt-1">
                  법정: 0.15 (중부1) ~ 0.25 (제주)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-3">
                  바닥 U-value (W/m²K)
                </label>
                <input
                  type="number"
                  value={envelopeData.u_floor}
                  onChange={(e) => setEnvelopeData({ ...envelopeData, u_floor: e.target.value })}
                  step="0.01"
                  min="0.01"
                  max="1.0"
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-green-600"
                />
                <p className="text-xs font-medium text-gray-500 mt-1">
                  법정: 0.15 (중부1) ~ 0.29 (제주)
                </p>
              </div>
            </div>

            {/* 방위별 외피 */}
            <div>
              <h4 className="text-base font-bold text-black mb-4">방위별 외벽 + 창호 성능</h4>

              {['S', 'N', 'E', 'W'].map(orientation => (
                <details key={orientation} className="border border-gray-200 mb-2">
                  <summary className="px-4 py-3 font-bold text-black cursor-pointer hover:bg-gray-50">
                    {orientation}향 (
                    {orientation === 'S' && '남향'}
                    {orientation === 'N' && '북향'}
                    {orientation === 'E' && '동향'}
                    {orientation === 'W' && '서향'}
                    )
                  </summary>
                  <div className="p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-black mb-2">
                          외벽 U-value (W/m²K)
                        </label>
                        <input
                          type="number"
                          value={envelopeData.walls[orientation as 'S' | 'N' | 'E' | 'W'].u_wall}
                          onChange={(e) => {
                            const newWalls = { ...envelopeData.walls }
                            newWalls[orientation as 'S' | 'N' | 'E' | 'W'].u_wall = e.target.value
                            setEnvelopeData({ ...envelopeData, walls: newWalls })
                          }}
                          step="0.01"
                          className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-green-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-black mb-2">
                          창호 U-value (W/m²K)
                        </label>
                        <input
                          type="number"
                          value={envelopeData.walls[orientation as 'S' | 'N' | 'E' | 'W'].u_window}
                          onChange={(e) => {
                            const newWalls = { ...envelopeData.walls }
                            newWalls[orientation as 'S' | 'N' | 'E' | 'W'].u_window = e.target.value
                            setEnvelopeData({ ...envelopeData, walls: newWalls })
                          }}
                          step="0.01"
                          className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-green-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-black mb-2">
                          WWR (%)
                        </label>
                        <input
                          type="number"
                          value={envelopeData.walls[orientation as 'S' | 'N' | 'E' | 'W'].wwr}
                          onChange={(e) => {
                            const newWalls = { ...envelopeData.walls }
                            newWalls[orientation as 'S' | 'N' | 'E' | 'W'].wwr = e.target.value
                            setEnvelopeData({ ...envelopeData, walls: newWalls })
                          }}
                          min="0"
                          max="100"
                          step="1"
                          className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-green-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-black mb-2">
                          SHGC
                        </label>
                        <input
                          type="number"
                          value={envelopeData.walls[orientation as 'S' | 'N' | 'E' | 'W'].shgc}
                          onChange={(e) => {
                            const newWalls = { ...envelopeData.walls }
                            newWalls[orientation as 'S' | 'N' | 'E' | 'W'].shgc = e.target.value
                            setEnvelopeData({ ...envelopeData, walls: newWalls })
                          }}
                          min="0"
                          max="1"
                          step="0.01"
                          className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-green-600"
                        />
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>

            {/* 기밀성 */}
            <div>
              <label className="block text-sm font-bold text-black mb-3">
                기밀성 n50 (ACH @ 50Pa)
              </label>
              <input
                type="number"
                value={envelopeData.airtightness}
                onChange={(e) => setEnvelopeData({ ...envelopeData, airtightness: e.target.value })}
                step="0.1"
                className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-green-600"
              />
              <p className="text-xs font-medium text-gray-500 mt-1">
                권장: 3.0 이하 (우수), 5.0 이하 (보통)
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: HVAC */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="border-l-4 border-orange-600 pl-4 bg-orange-50/50 py-3">
              <h3 className="text-xl font-black text-black">Tab 3: HVAC 시스템</h3>
              <p className="text-sm font-medium text-gray-700 mt-1">
                난방, 냉방, 환기 시스템을 설정하세요
              </p>
            </div>

            {/* 난방 */}
            <div className="border-2 border-orange-200 p-6 space-y-4">
              <h4 className="text-base font-bold text-black border-b-2 border-orange-200 pb-2">난방 시스템</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-3">열원 (Heat Source)</label>
                  <select
                    value={hvacData.heating_source}
                    onChange={(e) => setHvacData({ ...hvacData, heating_source: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-orange-600"
                  >
                    <option value="gas_boiler_condensing">가스보일러 (응축형)</option>
                    <option value="gas_boiler">가스보일러 (일반)</option>
                    <option value="heat_pump_air">공기열원 히트펌프</option>
                    <option value="heat_pump_ground">지열 히트펌프</option>
                    <option value="district_heating">지역난방</option>
                    <option value="electric">전기</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-3">공조 방식 (Distribution)</label>
                  <select
                    value={hvacData.heating_distribution}
                    onChange={(e) => setHvacData({ ...hvacData, heating_distribution: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-orange-600"
                  >
                    <option value="floor_heating">바닥난방 (Floor Heating)</option>
                    <option value="radiator">라디에이터 (Radiator)</option>
                    <option value="ahu">공기조화기 (AHU)</option>
                    <option value="fcu">팬코일유닛 (FCU)</option>
                    <option value="hot_air">온풍난방</option>
                  </select>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    BESS 방열지수: 바닥난방 1.0, 라디에이터 0.93
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-3">효율/COP</label>
                  <input
                    type="number"
                    value={hvacData.heating_efficiency}
                    onChange={(e) => setHvacData({ ...hvacData, heating_efficiency: e.target.value })}
                    step="0.01"
                    min="0.5"
                    max="5.0"
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-orange-600"
                  />
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    보일러: 0.85-0.95, HP: 2.5-4.5
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-3">설정 온도 (℃)</label>
                  <input
                    type="number"
                    value={hvacData.heating_setpoint}
                    onChange={(e) => setHvacData({ ...hvacData, heating_setpoint: e.target.value })}
                    min="18"
                    max="24"
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-orange-600"
                  />
                </div>
              </div>
            </div>

            {/* 냉방 */}
            <div className="border-2 border-blue-200 p-6 space-y-4">
              <h4 className="text-base font-bold text-black border-b-2 border-blue-200 pb-2">냉방 시스템</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-3">냉동기 (Chiller/HP)</label>
                  <select
                    value={hvacData.cooling_source}
                    onChange={(e) => setHvacData({ ...hvacData, cooling_source: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-blue-600"
                  >
                    <option value="split_ac">개별 에어컨 (Split AC)</option>
                    <option value="vrf">VRF 멀티</option>
                    <option value="chiller_air">공랭식 칠러</option>
                    <option value="chiller_water">수냉식 칠러</option>
                    <option value="heat_pump_ground">지열 히트펌프</option>
                    <option value="district_cooling">지역냉방</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-3">공조 방식 (Distribution)</label>
                  <select
                    value={hvacData.cooling_distribution}
                    onChange={(e) => setHvacData({ ...hvacData, cooling_distribution: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-blue-600"
                  >
                    <option value="ceiling_cassette">천정형 카세트</option>
                    <option value="fcu">팬코일유닛 (FCU)</option>
                    <option value="ahu">공기조화기 (AHU)</option>
                    <option value="wall_mount">벽걸이형</option>
                    <option value="floor_standing">바닥형</option>
                    <option value="radiant_cooling">복사냉방</option>
                  </select>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    팬/펌프 에너지 차이 반영
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-3">COP</label>
                  <input
                    type="number"
                    value={hvacData.cooling_cop}
                    onChange={(e) => setHvacData({ ...hvacData, cooling_cop: e.target.value })}
                    step="0.1"
                    min="2.0"
                    max="6.0"
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    공랭: 2.8-3.5, 수랭: 4.0-5.5, 지열: 4.5-5.5
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-3">설정 온도 (℃)</label>
                  <input
                    type="number"
                    value={hvacData.cooling_setpoint}
                    onChange={(e) => setHvacData({ ...hvacData, cooling_setpoint: e.target.value })}
                    min="24"
                    max="28"
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* 환기 */}
            <div className="border-2 border-purple-200 p-6 space-y-4">
              <h4 className="text-base font-bold text-black border-b-2 border-purple-200 pb-2">환기 시스템</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-3">환기 방식</label>
                  <select
                    value={hvacData.ventilation_type}
                    onChange={(e) => setHvacData({ ...hvacData, ventilation_type: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-purple-600"
                  >
                    <option value="natural">자연환기</option>
                    <option value="mechanical">기계환기</option>
                    <option value="hybrid">혼합환기</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-3">열회수 장치</label>
                  <select
                    value={hvacData.heat_recovery}
                    onChange={(e) => setHvacData({ ...hvacData, heat_recovery: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-purple-600"
                  >
                    <option value="false">없음</option>
                    <option value="true">있음</option>
                  </select>
                </div>
              </div>

              {hvacData.heat_recovery === 'true' && (
                <div>
                  <label className="block text-sm font-bold text-black mb-3">열회수 효율 (%)</label>
                  <input
                    type="number"
                    value={hvacData.heat_recovery_efficiency}
                    onChange={(e) => setHvacData({ ...hvacData, heat_recovery_efficiency: e.target.value })}
                    min="0"
                    max="85"
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-purple-600"
                  />
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    평판형: 50-60%, 회전형: 65-75%
                  </p>
                </div>
              )}
            </div>

            {/* 급탕 (v3.1 추가) */}
            <div className="border-2 border-pink-200 p-6 space-y-4">
              <h4 className="text-base font-bold text-black border-b-2 border-pink-200 pb-2">급탕 시스템</h4>

              <div>
                <label className="block text-sm font-bold text-black mb-3">급탕 열원</label>
                <select
                  value={hvacData.hot_water_source}
                  onChange={(e) => setHvacData({ ...hvacData, hot_water_source: e.target.value })}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-pink-600"
                >
                  <option value="same_as_heating">난방과 동일 열원</option>
                  <option value="dedicated_boiler">전용 가스보일러</option>
                  <option value="electric">전기온수기</option>
                  <option value="heat_pump">히트펌프 급탕기</option>
                  <option value="solar_thermal">태양열 + 보조열원</option>
                </select>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  일반적: 난방과 동일 (주거), 전용 (업무/호텔)
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-3">급탕 온도 (℃)</label>
                  <input
                    type="number"
                    value={hvacData.hot_water_temp}
                    onChange={(e) => setHvacData({ ...hvacData, hot_water_temp: e.target.value })}
                    min="50"
                    max="65"
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-pink-600"
                  />
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    권장: 55-60°C
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-3">저장 탱크</label>
                  <select
                    value={hvacData.hot_water_tank}
                    onChange={(e) => setHvacData({ ...hvacData, hot_water_tank: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-pink-600"
                  >
                    <option value="true">있음</option>
                    <option value="false">없음 (순간식)</option>
                  </select>
                </div>

                {hvacData.hot_water_tank === 'true' && (
                  <div>
                    <label className="block text-sm font-bold text-black mb-3">탱크 용량 (L)</label>
                    <input
                      type="number"
                      value={hvacData.hot_water_tank_volume}
                      onChange={(e) => setHvacData({ ...hvacData, hot_water_tank_volume: e.target.value })}
                      min="100"
                      step="50"
                      className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-pink-600"
                    />
                    <p className="text-xs font-medium text-gray-500 mt-1">
                      권장: 면적 × 0.1L
                    </p>
                  </div>
                )}
              </div>

              <div className="border-l-4 border-pink-600 pl-4 bg-pink-50 py-3">
                <p className="text-xs font-bold text-black">급탕 에너지 비중</p>
                <p className="text-xs font-medium text-gray-700 mt-1">
                  주거: 30% | 업무: 13% | 호텔: 25% | 교육: 10% | 판매: 8%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 조명 */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="border-l-4 border-yellow-600 pl-4 bg-yellow-50/50 py-3">
              <h3 className="text-xl font-black text-black">Tab 4: 조명 시스템</h3>
              <p className="text-sm font-medium text-gray-700 mt-1">
                조명 밀도와 제어 시스템을 설정하세요
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-3">광원 종류</label>
              <select
                value={lightingData.lighting_type}
                onChange={(e) => setLightingData({ ...lightingData, lighting_type: e.target.value })}
                className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-yellow-600"
              >
                <option value="led_high">LED 고효율 (130 lm/W)</option>
                <option value="led_normal">LED 일반 (100 lm/W)</option>
                <option value="fluorescent_t5">형광등 T5 (100 lm/W)</option>
                <option value="fluorescent_t8">형광등 T8 (85 lm/W)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-3">조명 밀도 (W/m²)</label>
              <input
                type="number"
                value={lightingData.lighting_density}
                onChange={(e) => setLightingData({ ...lightingData, lighting_density: e.target.value })}
                min="5"
                max="30"
                step="0.1"
                className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-yellow-600"
              />
              <p className="text-xs font-medium text-gray-500 mt-1">
                권장: 업무 8-12, 주거 5-8, 교육 10-15
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-black mb-3">제어 시스템 (절감 효과)</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lightingData.daylight_control === 'true'}
                    onChange={(e) => setLightingData({ ...lightingData, daylight_control: e.target.checked ? 'true' : 'false' })}
                    className="w-5 h-5"
                  />
                  <span className="flex-1 text-sm font-semibold text-black">
                    주광 제어 (30% 절감)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lightingData.occupancy_control === 'true'}
                    onChange={(e) => setLightingData({ ...lightingData, occupancy_control: e.target.checked ? 'true' : 'false' })}
                    className="w-5 h-5"
                  />
                  <span className="flex-1 text-sm font-semibold text-black">
                    재실 감지 제어 (20% 절감)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lightingData.schedule_control === 'true'}
                    onChange={(e) => setLightingData({ ...lightingData, schedule_control: e.target.checked ? 'true' : 'false' })}
                    className="w-5 h-5"
                  />
                  <span className="flex-1 text-sm font-semibold text-black">
                    시간 스케줄 제어 (10% 절감)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: 신재생 */}
        {activeTab === 5 && (
          <div className="space-y-6">
            <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3">
              <h3 className="text-xl font-black text-black">Tab 5: 신재생에너지</h3>
              <p className="text-sm font-medium text-gray-700 mt-1">
                설치할 신재생에너지 시스템을 선택하고 용량을 입력하세요
              </p>
            </div>

            {/* 태양광 (지붕형) */}
            <div className="border-2 border-orange-200 p-6 space-y-4">
              <h4 className="text-base font-bold text-black border-b-2 border-orange-200 pb-2">태양광 (지붕형)</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-3">용량 (kWp)</label>
                  <input
                    type="number"
                    value={renewableData.pv_rooftop_capacity}
                    onChange={(e) => setRenewableData({ ...renewableData, pv_rooftop_capacity: e.target.value })}
                    placeholder="200"
                    min="0"
                    step="1"
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-orange-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-3">경사각 (도)</label>
                  <input
                    type="number"
                    value={renewableData.pv_tilt}
                    onChange={(e) => setRenewableData({ ...renewableData, pv_tilt: e.target.value })}
                    min="0"
                    max="90"
                    className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-orange-600"
                  />
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    최적: 위도-10° (서울 27°)
                  </p>
                </div>
              </div>

              {/* pvlib 상세 분석 옵션 */}
              <details className="border-t-2 border-orange-200 pt-4">
                <summary className="text-sm font-bold text-orange-700 cursor-pointer hover:text-orange-900">
                  + 상세 분석 옵션 (pvlib 고급 기능)
                </summary>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-orange-100">
                  <div>
                    <label className="block text-xs font-bold text-black mb-2">모듈 타입</label>
                    <select
                      value={renewableData.pv_module_type}
                      onChange={(e) => setRenewableData({ ...renewableData, pv_module_type: e.target.value })}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-orange-600"
                    >
                      <option value="monocrystalline">단결정 (기준)</option>
                      <option value="polycrystalline">다결정 (-5%)</option>
                      <option value="thin_film">박막 (-15%)</option>
                      <option value="hit">HIT (+5%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2">추적 시스템</label>
                    <select
                      value={renewableData.pv_tracking}
                      onChange={(e) => setRenewableData({ ...renewableData, pv_tracking: e.target.value })}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-orange-600"
                    >
                      <option value="fixed">고정형 (기준)</option>
                      <option value="single_axis">단축 추적 (+25%)</option>
                      <option value="dual_axis">이축 추적 (+35%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-black">
                      <input
                        type="checkbox"
                        checked={renewableData.pv_bifacial === 'true'}
                        onChange={(e) => setRenewableData({ ...renewableData, pv_bifacial: e.target.checked ? 'true' : 'false' })}
                        className="w-4 h-4"
                      />
                      <span>양면형 모듈 (Bifacial, +15%)</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      뒷면 반사광 활용, 지면 반사율 높을수록 효과적
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2">음영 손실률 (%)</label>
                    <input
                      type="number"
                      value={renewableData.pv_shading_loss}
                      onChange={(e) => setRenewableData({ ...renewableData, pv_shading_loss: e.target.value })}
                      min="0"
                      max="50"
                      step="1"
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-orange-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2">인버터 효율 (%)</label>
                    <input
                      type="number"
                      value={renewableData.pv_inverter_efficiency}
                      onChange={(e) => setRenewableData({ ...renewableData, pv_inverter_efficiency: e.target.value })}
                      min="90"
                      max="99"
                      step="0.1"
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-orange-600"
                    />
                  </div>
                </div>
              </details>

              {/* Phase 1: 시스템 구성 */}
              <details className="border-t-2 border-orange-200 pt-4">
                <summary className="text-sm font-bold text-orange-700 cursor-pointer">
                  + 시스템 구성 (직렬/병렬)
                </summary>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-orange-100">
                  <div>
                    <label className="block text-xs font-bold mb-2">모듈 출력 (W)</label>
                    <input type="number" value={renewableData.pv_module_pmax}
                      onChange={(e) => setRenewableData({...renewableData, pv_module_pmax: e.target.value})}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2">DC/AC 비율</label>
                    <input type="number" value={renewableData.pv_dc_ac_ratio}
                      onChange={(e) => setRenewableData({...renewableData, pv_dc_ac_ratio: e.target.value})}
                      step="0.1" className="w-full border-2 border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>
              </details>

              {/* Phase 2: 손실 분석 */}
              <details className="border-t-2 border-orange-200 pt-4">
                <summary className="text-sm font-bold text-orange-700 cursor-pointer">
                  + 손실 요인 (Soiling, Snow, 케이블)
                </summary>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-orange-100">
                  <div>
                    <label className="block text-xs font-bold mb-2">먼지/오염 (%)</label>
                    <input type="number" value={renewableData.pv_soiling_loss}
                      onChange={(e) => setRenewableData({...renewableData, pv_soiling_loss: e.target.value})}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2">눈 (%)</label>
                    <input type="number" value={renewableData.pv_snow_loss}
                      onChange={(e) => setRenewableData({...renewableData, pv_snow_loss: e.target.value})}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2">케이블 (%)</label>
                    <input type="number" value={renewableData.pv_cable_loss}
                      onChange={(e) => setRenewableData({...renewableData, pv_cable_loss: e.target.value})}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2">Mismatch (%)</label>
                    <input type="number" value={renewableData.pv_mismatch_loss}
                      onChange={(e) => setRenewableData({...renewableData, pv_mismatch_loss: e.target.value})}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>
              </details>

              {/* Phase 3: 음영 분석 */}
              <details className="border-t-2 border-orange-200 pt-4">
                <summary className="text-sm font-bold text-orange-700 cursor-pointer">
                  + 음영 분석 (근거리/지평선)
                </summary>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold mb-2">근거리 음영 (%)</label>
                    <input type="number" value={renewableData.pv_near_shading_loss}
                      onChange={(e) => setRenewableData({...renewableData, pv_near_shading_loss: e.target.value})}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2">지평선 음영 (%)</label>
                    <input type="number" value={renewableData.pv_horizon_shading_loss}
                      onChange={(e) => setRenewableData({...renewableData, pv_horizon_shading_loss: e.target.value})}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>
              </details>

              {/* Phase 4: IAM */}
              <details className="border-t-2 border-orange-200 pt-4">
                <summary className="text-sm font-bold text-orange-700 cursor-pointer">
                  + IAM (입사각 수정자)
                </summary>
                <div className="mt-4">
                  <select value={renewableData.pv_iam_model}
                    onChange={(e) => setRenewableData({...renewableData, pv_iam_model: e.target.value})}
                    className="w-full border-2 border-gray-300 px-3 py-2 text-sm">
                    <option value="ashrae">Ashrae (간단, -2%)</option>
                    <option value="physical">Physical (정밀, -3%)</option>
                    <option value="none">사용 안 함</option>
                  </select>
                </div>
              </details>

              {/* Phase 6: 최적화 */}
              <details className="border-t-2 border-green-200 pt-4">
                <summary className="text-sm font-bold text-green-700 cursor-pointer">
                  + 최적 경사각 자동 계산
                </summary>
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={renewableData.pv_optimize_tilt === 'true'}
                      onChange={(e) => setRenewableData({...renewableData, pv_optimize_tilt: e.target.checked ? 'true' : 'false'})} />
                    <span className="text-sm font-bold">위도 기반 최적 경사각 자동 적용 (서울: 27°)</span>
                  </label>
                </div>
              </details>
            </div>

            {/* ESS */}
            <div className="border-2 border-purple-200 p-6 space-y-4">
              <h4 className="text-base font-bold text-black border-b-2 border-purple-200 pb-2">ESS (에너지 저장)</h4>

              <div>
                <label className="block text-sm font-bold text-black mb-3">저장 용량 (kWh)</label>
                <input
                  type="number"
                  value={renewableData.ess_capacity}
                  onChange={(e) => setRenewableData({ ...renewableData, ess_capacity: e.target.value })}
                  placeholder="80"
                  min="0"
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold focus:outline-none focus:border-purple-600"
                />
                <p className="text-xs font-medium text-gray-500 mt-1">
                  권장: 태양광 용량의 30-50% (자립률 10-20%p 향상)
                </p>
              </div>
            </div>

            {/* 기타 신재생 */}
            <details className="border-2 border-gray-200 p-4">
              <summary className="text-sm font-bold text-black cursor-pointer hover:text-green-600">
                기타 신재생 (지열, 연료전지, 태양열, 수열)
              </summary>
              <div className="mt-4 space-y-4">
                {/* 지열 */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">지열 용량 (kW)</label>
                  <input
                    type="number"
                    value={renewableData.geothermal_capacity}
                    onChange={(e) => setRenewableData({ ...renewableData, geothermal_capacity: e.target.value })}
                    placeholder="0"
                    className="w-full border-2 border-gray-300 px-4 py-2 text-sm font-semibold focus:outline-none focus:border-green-600"
                  />
                </div>

                {/* 연료전지 */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">연료전지 용량 (kW)</label>
                  <input
                    type="number"
                    value={renewableData.fuel_cell_capacity}
                    onChange={(e) => setRenewableData({ ...renewableData, fuel_cell_capacity: e.target.value })}
                    placeholder="0"
                    className="w-full border-2 border-gray-300 px-4 py-2 text-sm font-semibold focus:outline-none focus:border-green-600"
                  />
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border-l-4 border-red-600 bg-red-50 pl-4 py-4 mt-6">
            <p className="text-base font-bold text-red-600 mb-2">오류</p>
            <p className="text-sm font-medium text-gray-700">{error}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t-2 border-gray-200 pt-6">
        <button
          onClick={onCancel}
          className="border-2 border-gray-300 px-6 py-3 text-sm font-bold text-black hover:border-black"
        >
          취소
        </button>

        <div className="flex items-center gap-3">
          {activeTab > 1 && (
            <button
              onClick={() => setActiveTab(activeTab - 1)}
              className="border-2 border-gray-400 px-6 py-3 text-sm font-bold text-black hover:border-black"
            >
              ← 이전
            </button>
          )}

          {activeTab < 5 ? (
            <button
              onClick={() => setActiveTab(activeTab + 1)}
              className="border-2 border-blue-600 bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              다음 →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="border-2 border-red-600 bg-red-600 px-8 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? '저장 중...' : 'Alternative 저장'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

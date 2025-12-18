'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DetailedAlternativeFormProps {
  projectId: number;
  projectData: {
    building_type: string;
    area: number;
    location: string;
  };
  editMode?: boolean;
  existingData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DetailedAlternativeForm({
  projectId,
  projectData,
  editMode = false,
  existingData,
  onClose,
  onSuccess
}: DetailedAlternativeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // 5개 탭 정의
  const tabs = ['외피', '시스템', '신재생', '운영', '경제성'];

  // 상세 모드 폼 데이터
  const [formData, setFormData] = useState({
    // 기본 정보
    alt_name: existingData?.alt_name || '',
    description: existingData?.description || '',

    // 1. 외피 (Envelope) - 8방위별
    envelope: {
      roof: { u_value: 0.15, area: 0 },
      wall: {
        north: { u_value: 0.24, area: 0 },
        south: { u_value: 0.24, area: 0 },
        east: { u_value: 0.24, area: 0 },
        west: { u_value: 0.24, area: 0 },
        northeast: { u_value: 0.24, area: 0 },
        northwest: { u_value: 0.24, area: 0 },
        southeast: { u_value: 0.24, area: 0 },
        southwest: { u_value: 0.24, area: 0 },
      },
      window: {
        north: { u_value: 1.5, shgc: 0.3, area: 0 },
        south: { u_value: 1.5, shgc: 0.3, area: 0 },
        east: { u_value: 1.5, shgc: 0.3, area: 0 },
        west: { u_value: 1.5, shgc: 0.3, area: 0 },
        northeast: { u_value: 1.5, shgc: 0.3, area: 0 },
        northwest: { u_value: 1.5, shgc: 0.3, area: 0 },
        southeast: { u_value: 1.5, shgc: 0.3, area: 0 },
        southwest: { u_value: 1.5, shgc: 0.3, area: 0 },
      },
      floor: { u_value: 0.17, area: 0 },
    },

    // 2. 시스템 (Systems)
    systems: {
      heating: {
        type: 'boiler',
        efficiency: 0.87,
        fuel: 'gas',
        setpoint: 20,
      },
      cooling: {
        type: 'chiller',
        cop: 3.5,
        setpoint: 26,
      },
      hot_water: {
        type: 'boiler',
        efficiency: 0.85,
        fuel: 'gas',
        demand: 40, // L/person/day
      },
      lighting: {
        density: 10, // W/m²
        control: 'manual',
        sensor: false,
      },
      ventilation: {
        rate: 0.8, // ACH
        heat_recovery: false,
        efficiency: 0,
      },
    },

    // 3. 신재생 (Renewables)
    renewables: {
      pv_rooftop: {
        capacity: 0,
        tilt: 30,
        azimuth: 180,
        efficiency: 0.18,
      },
      pv_bipv: {
        area: 0,
        orientation: 'south',
        efficiency: 0.15,
      },
      solar_thermal: {
        area: 0,
        efficiency: 0.5,
      },
      geothermal: {
        capacity: 0,
        cop: 4.0,
      },
      fuel_cell: {
        capacity: 0,
        efficiency: 0.45,
      },
      ess: {
        capacity: 0,
        efficiency: 0.95,
        discharge_hours: 4,
      },
    },

    // 4. 운영 (Operation)
    operation: {
      occupancy: {
        density: 0.1, // person/m²
        schedule_weekday: '08:00-18:00',
        schedule_weekend: 'closed',
      },
      equipment: {
        density: 15, // W/m²
        schedule: 'office_hours',
      },
      infiltration: {
        rate: 0.3, // ACH
      },
      setback: {
        heating: 15, // °C (unoccupied)
        cooling: 30, // °C (unoccupied)
      },
    },

    // 5. 경제성 (Economic)
    economic: {
      initial_cost: {
        construction: 0,
        renewable: 0,
        system: 0,
      },
      operational_cost: {
        electricity: 130, // 원/kWh
        gas: 60, // 원/kWh
        maintenance: 10000, // 원/m²/년
      },
      incentives: {
        renewable_subsidy: 0.3, // 30%
        tax_credit: 0,
      },
      analysis_period: 20, // years
      discount_rate: 0.05, // 5%
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const url = editMode && existingData
        ? `${API_URL}/calzeb/projects/${projectId}/alternatives/${existingData.id}/detailed`
        : `${API_URL}/calzeb/projects/${projectId}/alternatives/detailed`;

      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alt_name: formData.alt_name,
          description: formData.description,
          detailed_data: formData,
          project_data: projectData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save alternative');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const directions = ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'];
  const directionLabels: Record<string, string> = {
    north: '북',
    south: '남',
    east: '동',
    west: '서',
    northeast: '북동',
    northwest: '북서',
    southeast: '남동',
    southwest: '남서',
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-black max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="border-b-4 border-gray-200 p-6 bg-gradient-to-r from-amber-50 to-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-black text-black mb-2">
                {editMode ? 'Alternative 편집 (상세)' : 'Alternative 추가 (상세)'}
              </h2>
              <p className="text-sm font-semibold text-gray-600">
                상세 모드 - 5개 탭 전체 입력
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black transition-colors font-black text-3xl"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentTab(idx)}
                className={`
                  px-6 py-3 text-sm font-bold whitespace-nowrap transition-all
                  ${currentTab === idx
                    ? 'border-b-4 border-red-600 text-black bg-red-50'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-black'
                  }
                `}
              >
                {idx + 1}. {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Basic Info (Always shown) */}
          {currentTab === -1 && (
            <div className="mb-8 space-y-6">
              <div className="bg-white border-2 border-gray-200 p-6">
                <label className="block text-base font-black text-black mb-3">
                  Alternative 이름 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.alt_name}
                  onChange={(e) => setFormData({ ...formData, alt_name: e.target.value })}
                  placeholder="예: 고성능 외피 + PV 200kW"
                  required
                  className="w-full border-2 border-gray-300 px-5 py-4 text-lg font-semibold focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Tab 0: 외피 (Envelope) */}
            {currentTab === 0 && (
              <motion.div
                key="tab-envelope"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3">
                  <p className="text-base font-bold text-black">
                    외피 성능 입력 - 8방위별 상세 설정
                  </p>
                </div>

                {/* 지붕 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">지붕</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">열관류율 (W/m²·K)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.envelope.roof.u_value}
                        onChange={(e) => setFormData({
                          ...formData,
                          envelope: {
                            ...formData.envelope,
                            roof: { ...formData.envelope.roof, u_value: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">면적 (m²)</label>
                      <input
                        type="number"
                        value={formData.envelope.roof.area}
                        onChange={(e) => setFormData({
                          ...formData,
                          envelope: {
                            ...formData.envelope,
                            roof: { ...formData.envelope.roof, area: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 외벽 - 8방위 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">외벽 (8방위)</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {directions.map((dir) => (
                      <div key={dir} className="border border-gray-200 p-3">
                        <h4 className="font-bold text-sm mb-2">{directionLabels[dir]}</h4>
                        <div className="space-y-2">
                          <input
                            type="number"
                            step="0.01"
                            value={(formData.envelope.wall as any)[dir].u_value}
                            onChange={(e) => {
                              const newWall = { ...formData.envelope.wall };
                              (newWall as any)[dir].u_value = parseFloat(e.target.value);
                              setFormData({
                                ...formData,
                                envelope: { ...formData.envelope, wall: newWall }
                              });
                            }}
                            placeholder="U값"
                            className="w-full border border-gray-300 px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            value={(formData.envelope.wall as any)[dir].area}
                            onChange={(e) => {
                              const newWall = { ...formData.envelope.wall };
                              (newWall as any)[dir].area = parseFloat(e.target.value);
                              setFormData({
                                ...formData,
                                envelope: { ...formData.envelope, wall: newWall }
                              });
                            }}
                            placeholder="면적 m²"
                            className="w-full border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 창호 - 8방위 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">창호 (8방위)</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {directions.map((dir) => (
                      <div key={dir} className="border border-gray-200 p-3">
                        <h4 className="font-bold text-sm mb-2">{directionLabels[dir]}</h4>
                        <div className="space-y-2">
                          <input
                            type="number"
                            step="0.01"
                            value={(formData.envelope.window as any)[dir].u_value}
                            onChange={(e) => {
                              const newWindow = { ...formData.envelope.window };
                              (newWindow as any)[dir].u_value = parseFloat(e.target.value);
                              setFormData({
                                ...formData,
                                envelope: { ...formData.envelope, window: newWindow }
                              });
                            }}
                            placeholder="U값"
                            className="w-full border border-gray-300 px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={(formData.envelope.window as any)[dir].shgc}
                            onChange={(e) => {
                              const newWindow = { ...formData.envelope.window };
                              (newWindow as any)[dir].shgc = parseFloat(e.target.value);
                              setFormData({
                                ...formData,
                                envelope: { ...formData.envelope, window: newWindow }
                              });
                            }}
                            placeholder="SHGC"
                            className="w-full border border-gray-300 px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            value={(formData.envelope.window as any)[dir].area}
                            onChange={(e) => {
                              const newWindow = { ...formData.envelope.window };
                              (newWindow as any)[dir].area = parseFloat(e.target.value);
                              setFormData({
                                ...formData,
                                envelope: { ...formData.envelope, window: newWindow }
                              });
                            }}
                            placeholder="면적 m²"
                            className="w-full border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 1: 시스템 (Systems) */}
            {currentTab === 1 && (
              <motion.div
                key="tab-systems"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3">
                  <p className="text-base font-bold text-black">
                    기계/전기 시스템 설정
                  </p>
                </div>

                {/* 난방 시스템 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">난방 시스템</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">시스템 종류</label>
                      <select
                        value={formData.systems.heating.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          systems: {
                            ...formData.systems,
                            heating: { ...formData.systems.heating, type: e.target.value }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      >
                        <option value="boiler">보일러</option>
                        <option value="heat_pump">히트펌프</option>
                        <option value="district">지역난방</option>
                        <option value="electric">전기난방</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">효율/COP</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.systems.heating.efficiency}
                        onChange={(e) => setFormData({
                          ...formData,
                          systems: {
                            ...formData.systems,
                            heating: { ...formData.systems.heating, efficiency: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">연료</label>
                      <select
                        value={formData.systems.heating.fuel}
                        onChange={(e) => setFormData({
                          ...formData,
                          systems: {
                            ...formData.systems,
                            heating: { ...formData.systems.heating, fuel: e.target.value }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      >
                        <option value="gas">가스</option>
                        <option value="electricity">전기</option>
                        <option value="oil">기름</option>
                        <option value="district">지역난방</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">설정온도 (°C)</label>
                      <input
                        type="number"
                        value={formData.systems.heating.setpoint}
                        onChange={(e) => setFormData({
                          ...formData,
                          systems: {
                            ...formData.systems,
                            heating: { ...formData.systems.heating, setpoint: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 냉방 시스템 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">냉방 시스템</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">시스템 종류</label>
                      <select
                        value={formData.systems.cooling.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          systems: {
                            ...formData.systems,
                            cooling: { ...formData.systems.cooling, type: e.target.value }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      >
                        <option value="chiller">칠러</option>
                        <option value="vrf">VRF</option>
                        <option value="pac">패키지에어컨</option>
                        <option value="district">지역냉방</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">COP</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.systems.cooling.cop}
                        onChange={(e) => setFormData({
                          ...formData,
                          systems: {
                            ...formData.systems,
                            cooling: { ...formData.systems.cooling, cop: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">설정온도 (°C)</label>
                      <input
                        type="number"
                        value={formData.systems.cooling.setpoint}
                        onChange={(e) => setFormData({
                          ...formData,
                          systems: {
                            ...formData.systems,
                            cooling: { ...formData.systems.cooling, setpoint: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 조명 시스템 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">조명 시스템</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">조명밀도 (W/m²)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.systems.lighting.density}
                        onChange={(e) => setFormData({
                          ...formData,
                          systems: {
                            ...formData.systems,
                            lighting: { ...formData.systems.lighting, density: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">제어방식</label>
                      <select
                        value={formData.systems.lighting.control}
                        onChange={(e) => setFormData({
                          ...formData,
                          systems: {
                            ...formData.systems,
                            lighting: { ...formData.systems.lighting, control: e.target.value }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      >
                        <option value="manual">수동</option>
                        <option value="schedule">스케줄</option>
                        <option value="occupancy">재실감지</option>
                        <option value="daylight">주광연계</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: 신재생 (Renewables) */}
            {currentTab === 2 && (
              <motion.div
                key="tab-renewables"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3">
                  <p className="text-base font-bold text-black">
                    신재생에너지 시스템
                  </p>
                </div>

                {/* 태양광 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">태양광 발전</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">설치용량 (kWp)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.renewables.pv_rooftop.capacity}
                        onChange={(e) => setFormData({
                          ...formData,
                          renewables: {
                            ...formData.renewables,
                            pv_rooftop: { ...formData.renewables.pv_rooftop, capacity: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">경사각 (°)</label>
                      <input
                        type="number"
                        value={formData.renewables.pv_rooftop.tilt}
                        onChange={(e) => setFormData({
                          ...formData,
                          renewables: {
                            ...formData.renewables,
                            pv_rooftop: { ...formData.renewables.pv_rooftop, tilt: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">방위각 (°)</label>
                      <input
                        type="number"
                        value={formData.renewables.pv_rooftop.azimuth}
                        onChange={(e) => setFormData({
                          ...formData,
                          renewables: {
                            ...formData.renewables,
                            pv_rooftop: { ...formData.renewables.pv_rooftop, azimuth: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 지열 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">지열 시스템</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">설치용량 (kW)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.renewables.geothermal.capacity}
                        onChange={(e) => setFormData({
                          ...formData,
                          renewables: {
                            ...formData.renewables,
                            geothermal: { ...formData.renewables.geothermal, capacity: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">COP</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.renewables.geothermal.cop}
                        onChange={(e) => setFormData({
                          ...formData,
                          renewables: {
                            ...formData.renewables,
                            geothermal: { ...formData.renewables.geothermal, cop: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* ESS */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">에너지저장장치 (ESS)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">용량 (kWh)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.renewables.ess.capacity}
                        onChange={(e) => setFormData({
                          ...formData,
                          renewables: {
                            ...formData.renewables,
                            ess: { ...formData.renewables.ess, capacity: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">효율 (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.renewables.ess.efficiency * 100}
                        onChange={(e) => setFormData({
                          ...formData,
                          renewables: {
                            ...formData.renewables,
                            ess: { ...formData.renewables.ess, efficiency: parseFloat(e.target.value) / 100 }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">방전시간 (h)</label>
                      <input
                        type="number"
                        value={formData.renewables.ess.discharge_hours}
                        onChange={(e) => setFormData({
                          ...formData,
                          renewables: {
                            ...formData.renewables,
                            ess: { ...formData.renewables.ess, discharge_hours: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: 운영 (Operation) */}
            {currentTab === 3 && (
              <motion.div
                key="tab-operation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3">
                  <p className="text-base font-bold text-black">
                    건물 운영 조건
                  </p>
                </div>

                {/* 재실 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">재실 조건</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">재실밀도 (인/m²)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.operation.occupancy.density}
                        onChange={(e) => setFormData({
                          ...formData,
                          operation: {
                            ...formData.operation,
                            occupancy: { ...formData.operation.occupancy, density: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">평일 스케줄</label>
                      <input
                        type="text"
                        value={formData.operation.occupancy.schedule_weekday}
                        onChange={(e) => setFormData({
                          ...formData,
                          operation: {
                            ...formData.operation,
                            occupancy: { ...formData.operation.occupancy, schedule_weekday: e.target.value }
                          }
                        })}
                        placeholder="예: 08:00-18:00"
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 기기발열 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">기기 발열</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">기기밀도 (W/m²)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.operation.equipment.density}
                        onChange={(e) => setFormData({
                          ...formData,
                          operation: {
                            ...formData.operation,
                            equipment: { ...formData.operation.equipment, density: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">운영 스케줄</label>
                      <select
                        value={formData.operation.equipment.schedule}
                        onChange={(e) => setFormData({
                          ...formData,
                          operation: {
                            ...formData.operation,
                            equipment: { ...formData.operation.equipment, schedule: e.target.value }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      >
                        <option value="office_hours">업무시간</option>
                        <option value="24/7">24시간</option>
                        <option value="custom">사용자정의</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 온도 설정 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">비재실 온도설정</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">난방 설정온도 (°C)</label>
                      <input
                        type="number"
                        value={formData.operation.setback.heating}
                        onChange={(e) => setFormData({
                          ...formData,
                          operation: {
                            ...formData.operation,
                            setback: { ...formData.operation.setback, heating: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">냉방 설정온도 (°C)</label>
                      <input
                        type="number"
                        value={formData.operation.setback.cooling}
                        onChange={(e) => setFormData({
                          ...formData,
                          operation: {
                            ...formData.operation,
                            setback: { ...formData.operation.setback, cooling: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 4: 경제성 (Economic) */}
            {currentTab === 4 && (
              <motion.div
                key="tab-economic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3">
                  <p className="text-base font-bold text-black">
                    경제성 분석 입력
                  </p>
                </div>

                {/* 초기 투자비 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">초기 투자비</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">건설비 (원/m²)</label>
                      <input
                        type="number"
                        value={formData.economic.initial_cost.construction}
                        onChange={(e) => setFormData({
                          ...formData,
                          economic: {
                            ...formData.economic,
                            initial_cost: { ...formData.economic.initial_cost, construction: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">신재생 설치비 (원)</label>
                      <input
                        type="number"
                        value={formData.economic.initial_cost.renewable}
                        onChange={(e) => setFormData({
                          ...formData,
                          economic: {
                            ...formData.economic,
                            initial_cost: { ...formData.economic.initial_cost, renewable: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">시스템 비용 (원)</label>
                      <input
                        type="number"
                        value={formData.economic.initial_cost.system}
                        onChange={(e) => setFormData({
                          ...formData,
                          economic: {
                            ...formData.economic,
                            initial_cost: { ...formData.economic.initial_cost, system: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 운영비 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">운영비</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">전기요금 (원/kWh)</label>
                      <input
                        type="number"
                        value={formData.economic.operational_cost.electricity}
                        onChange={(e) => setFormData({
                          ...formData,
                          economic: {
                            ...formData.economic,
                            operational_cost: { ...formData.economic.operational_cost, electricity: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">가스요금 (원/kWh)</label>
                      <input
                        type="number"
                        value={formData.economic.operational_cost.gas}
                        onChange={(e) => setFormData({
                          ...formData,
                          economic: {
                            ...formData.economic,
                            operational_cost: { ...formData.economic.operational_cost, gas: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">유지보수비 (원/m²·년)</label>
                      <input
                        type="number"
                        value={formData.economic.operational_cost.maintenance}
                        onChange={(e) => setFormData({
                          ...formData,
                          economic: {
                            ...formData.economic,
                            operational_cost: { ...formData.economic.operational_cost, maintenance: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 분석 조건 */}
                <div className="bg-white border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black mb-4">분석 조건</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">분석 기간 (년)</label>
                      <input
                        type="number"
                        value={formData.economic.analysis_period}
                        onChange={(e) => setFormData({
                          ...formData,
                          economic: { ...formData.economic, analysis_period: parseInt(e.target.value) }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">할인율 (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.economic.discount_rate * 100}
                        onChange={(e) => setFormData({
                          ...formData,
                          economic: { ...formData.economic, discount_rate: parseFloat(e.target.value) / 100 }
                        })}
                        className="w-full border-2 border-gray-300 px-3 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* NPV/IRR 예상 결과 */}
                <div className="border-2 border-blue-600 bg-blue-50 p-6">
                  <h3 className="text-lg font-black text-black mb-4">경제성 지표 (자동 계산)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">NPV (20년)</p>
                      <p className="text-2xl font-black text-blue-600">계산 대기</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">IRR</p>
                      <p className="text-2xl font-black text-blue-600">계산 대기</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">투자회수기간</p>
                      <p className="text-2xl font-black text-blue-600">계산 대기</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <div className="mt-6 border-l-4 border-red-600 bg-red-50 pl-4 py-4">
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 px-6 py-3 text-sm font-bold text-black hover:border-black transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 border-2 border-red-600 bg-red-600 text-white px-6 py-3 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : (editMode ? '수정 완료' : '생성')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
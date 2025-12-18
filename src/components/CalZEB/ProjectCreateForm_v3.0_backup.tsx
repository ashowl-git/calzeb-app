// ProjectCreateForm - 프로젝트 생성 폼 (2단계)
// Design: LESS IS MORE Minimalism
// Based on: 06_UXUI설계.md Section 9.2, 19_프로젝트_공통정보_설계.md

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createProject } from '@/lib/calzeb/api'

interface ProjectCreateFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ProjectCreateForm({ onClose, onSuccess }: ProjectCreateFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    building_type: 'office',
    area: '',
    location: 'seoul'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = {
        name: formData.name,
        description: formData.description || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
        building_type: formData.building_type,
        area: parseFloat(formData.area),
        location: formData.location
      }

      await createProject(data)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="border-b-2 border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-black">
              새 프로젝트 생성 - Step {step}/2
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black transition-colors duration-150 font-bold text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-l-4 border-red-600 pl-4 bg-red-50/50 py-3">
                <p className="text-base font-bold text-black">
                  Tier 1: 공통 정보 (필수)
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
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
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
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150 cursor-pointer"
                >
                  <option value="residential">주거시설 (아파트, 주택)</option>
                  <option value="office">업무시설 (오피스)</option>
                  <option value="educational">교육시설 (학교, 학원)</option>
                  <option value="retail">판매시설 (상가, 마트)</option>
                  <option value="hotel">숙박시설 (호텔, 모텔)</option>
                </select>
              </div>

              {/* 연면적 */}
              <div>
                <label className="block text-sm font-bold text-black mb-3">
                  연면적 (m²) <span className="text-red-600 font-black">*</span>
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="예: 5000"
                  min="10"
                  max="1000000"
                  required
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                />
              </div>

              {/* 위치 */}
              <div>
                <label className="block text-sm font-bold text-black mb-3">
                  위치 <span className="text-red-600 font-black">*</span>
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-semibold text-black focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150 cursor-pointer"
                >
                  <option value="seoul">서울</option>
                  <option value="busan">부산</option>
                  <option value="daegu">대구</option>
                  <option value="incheon">인천</option>
                </select>
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-bold text-black mb-3">
                  설명 (선택)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="예: 5,000m² 업무시설, ZEB 2등급 목표"
                  rows={3}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-medium text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150 resize-none"
                />
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-sm font-bold text-black mb-3">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="예: office, seoul, zeb-2"
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base font-medium text-black placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-red-600 focus:border-4 transition-all duration-150"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 border-l-4 border-red-600 bg-red-50 pl-4 py-3">
              <p className="text-base font-bold text-red-600">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
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

// ProjectCard - 프로젝트 카드
// Design: LESS IS MORE Minimalism

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

interface ProjectCardProps {
  project: {
    project_id: number
    name: string
    description?: string
    tags?: string[]
    building_type: string
    area: number
    location: string
    calculation_mode: string
    alternatives_count: number
    created_at: string
    updated_at: string
  }
  onDelete?: () => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/calzeb/projects/${project.project_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('삭제 실패')
      }

      // 삭제 성공 시 부모 컴포넌트에 알림
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error)
      alert('프로젝트 삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-gray-200 p-6 hover:border-red-600 transition-all duration-150"
    >
      {/* Header */}
      <div className="mb-4 pb-4 border-b-2 border-gray-200">
        <h3 className="font-black text-black mb-2">{project.name}</h3>
        {project.description && (
          <p className="text-sm font-medium text-gray-700">{project.description}</p>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm font-medium text-black">
          <span className="w-20 text-gray-600 font-bold">건물</span>
          <span className="border-l-2 border-gray-400 pl-2 font-semibold">{project.building_type}</span>
        </div>
        <div className="flex items-center text-sm font-medium text-black">
          <span className="w-20 text-gray-600 font-bold">면적</span>
          <span className="border-l-2 border-gray-400 pl-2 font-semibold">{project.area.toLocaleString()} m²</span>
        </div>
        <div className="flex items-center text-sm font-medium text-black">
          <span className="w-20 text-gray-600 font-bold">위치</span>
          <span className="border-l-2 border-gray-400 pl-2 font-semibold">{project.location}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 py-3 border-t-2 border-b-2 border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">Alternative</span>
          <span className="text-xl font-black text-red-600">{project.alternatives_count}개</span>
        </div>
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="border border-gray-400 px-2 py-1 text-xs font-semibold text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t-2 border-gray-200">
        <Link
          href={`/projects/${project.project_id}`}
          className="flex-1 text-center border-2 border-red-600 text-red-600 px-4 py-2 text-sm font-bold hover:bg-red-600 hover:text-white transition-all duration-150"
        >
          열기
        </Link>
        <button
          className="border-2 border-gray-300 px-4 py-2 text-sm font-bold text-black hover:border-black transition-colors duration-150"
        >
          편집
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="border-2 border-gray-300 px-4 py-2 text-sm font-bold text-red-600 hover:border-red-600 transition-colors duration-150"
        >
          삭제
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white border-4 border-red-600 p-6 max-w-md">
            <h3 className="text-xl font-black text-black mb-4">프로젝트 삭제 확인</h3>
            <p className="text-sm font-medium text-gray-700 mb-2">
              정말로 "{project.name}" 프로젝트를 삭제하시겠습니까?
            </p>
            <p className="text-sm font-bold text-red-600 mb-6">
              ⚠️ Alternative {project.alternatives_count}개가 함께 삭제됩니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 border-2 border-red-600 bg-red-600 text-white px-4 py-2 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 border-2 border-gray-600 text-gray-600 px-4 py-2 text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-medium text-gray-500">
        최종 수정: {new Date(project.updated_at).toLocaleDateString('ko-KR')}
      </div>
    </motion.div>
  )
}

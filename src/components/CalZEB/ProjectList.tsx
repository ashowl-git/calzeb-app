// ProjectList - 프로젝트 카드 그리드
// Design: LESS IS MORE Minimalism

'use client'

import ProjectCard from './ProjectCard'

interface ProjectListProps {
  projects: any[]
  onRefresh: () => void
}

export default function ProjectList({ projects, onRefresh }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="border-2 border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="border-t-4 border-red-600 w-24 mx-auto mb-6"></div>
          <p className="text-xl font-black text-black mb-2">프로젝트가 없습니다</p>
          <p className="text-base font-semibold text-gray-700">
            새 프로젝트를 생성하여 ZEB 등급 계산을 시작하세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.project_id}
          project={project}
          onDelete={onRefresh}
        />
      ))}
    </div>
  )
}

// ExcelUpload - Excel 파일 업로드 UI (드래그앤드롭 + 진행률)
// Design: 블랙 볼드체 + 최고 수준의 UX
// Features: 드래그앤드롭, 템플릿 다운로드, 실시간 진행률, 에러 핸들링

'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExcelUploadProps {
  projectId: number
  mode: 'simple' | 'detailed'
  onSuccess: () => void
}

export default function ExcelUpload({ projectId, mode, onSuccess }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentItem, setCurrentItem] = useState('')
  const [totalItems, setTotalItems] = useState(0)
  const [completedItems, setCompletedItems] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [results, setResults] = useState<any>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(f =>
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.xlsm')
    )

    if (excelFile) {
      setFile(excelFile)
      setError(null)
    } else {
      setError('Excel 파일(.xlsx, .xls, .xlsm)만 업로드 가능합니다')
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleTemplateDownload = async () => {
    const templateName = mode === 'simple'
      ? 'calzeb_alternatives_simple_template.xlsx'
      : 'calzeb_alternatives_detailed_template.xlsx'

    try {
      const response = await fetch(`${API_URL}/calzeb/templates/${templateName}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = templateName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('템플릿 다운로드 실패')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)
    setCompletedItems(0)
    setTotalItems(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', projectId.toString())

      // 업로드 및 처리 시작
      const response = await fetch(`${API_URL}/calzeb/bulk-upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Excel 업로드 실패')

      // 진행률 폴링 시작 (1초마다)
      progressIntervalRef.current = setInterval(async () => {
        try {
          const progressRes = await fetch(`${API_URL}/calzeb/bulk-upload/progress/${projectId}`)
          const progressData = await progressRes.json()

          setTotalItems(progressData.total || 0)
          setCompletedItems(progressData.completed || 0)
          setCurrentItem(progressData.current_item || '')

          if (progressData.total > 0) {
            const percent = Math.round((progressData.completed / progressData.total) * 100)
            setProgress(percent)
          }

          // 완료 시
          if (progressData.status === 'completed') {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
              progressIntervalRef.current = null
            }
            setProgress(100)
            setResults(progressData.results)
            setUploading(false)
            setTimeout(() => onSuccess(), 1000)
          }

          // 에러 시
          if (progressData.status === 'error') {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
              progressIntervalRef.current = null
            }
            setError(progressData.error || '처리 중 오류 발생')
            setUploading(false)
          }
        } catch (e) {
          console.error('Progress fetch error:', e)
        }
      }, 1000)

    } catch (err: any) {
      setError(err.message)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 템플릿 다운로드 */}
      <div className="bg-white border-2 border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-black mb-2">
              1단계: Excel 템플릿 다운로드
            </h3>
            <p className="text-sm font-medium text-gray-700">
              {mode === 'simple'
                ? '간편 모드 템플릿 (신재생만, 15개 컬럼)'
                : '상세 모드 템플릿 (외피 + 신재생, 25개 컬럼)'
              }
            </p>
          </div>

          <button
            type="button"
            onClick={handleTemplateDownload}
            className="border-2 border-black bg-black text-white px-6 py-3 text-sm font-bold hover:bg-gray-900 transition-colors duration-150 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            템플릿 다운로드
          </button>
        </div>

        <div className="border-l-4 border-blue-600 bg-blue-50 pl-4 py-3 mt-4">
          <p className="text-sm font-bold text-blue-900 mb-2">
            템플릿 작성 가이드
          </p>
          <ul className="text-sm font-medium text-blue-800 space-y-1">
            <li>• 1행: 헤더 (수정 금지)</li>
            <li>• 2행부터: Alternative 데이터 입력</li>
            <li>• alt_name은 필수, 나머지는 선택</li>
            <li>• 최대 100개 Alternative 입력 가능</li>
          </ul>
        </div>
      </div>

      {/* 파일 업로드 */}
      <div className="bg-white border-2 border-gray-200 p-6">
        <h3 className="text-xl font-black text-black mb-4">
          2단계: Excel 파일 업로드
        </h3>

        {/* 드래그앤드롭 영역 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-4 border-dashed p-12 text-center transition-all duration-200
            ${isDragging
              ? 'border-red-600 bg-red-50/50'
              : 'border-gray-300 bg-gray-50/50 hover:border-gray-400'
            }
          `}
        >
          <div className="max-w-md mx-auto">
            {!file ? (
              <>
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg font-black text-black mb-2">
                  Excel 파일을 여기에 드롭하세요
                </p>
                <p className="text-sm font-semibold text-gray-600 mb-4">
                  또는 클릭하여 파일 선택
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-gray-400 bg-white px-6 py-3 text-sm font-bold text-black hover:border-black transition-colors duration-150"
                >
                  파일 선택
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.xlsm"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            ) : (
              <>
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-black text-black mb-2">{file.name}</p>
                <p className="text-sm font-semibold text-gray-600 mb-4">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="border-2 border-gray-400 px-4 py-2 text-sm font-bold text-black hover:border-black transition-colors duration-150"
                >
                  다른 파일 선택
                </button>
              </>
            )}
          </div>
        </div>

        {/* 업로드 버튼 */}
        {file && !uploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <button
              type="button"
              onClick={handleUpload}
              className="border-2 border-red-600 bg-red-600 text-white px-10 py-4 text-base font-bold hover:bg-red-700 transition-colors duration-150"
            >
              업로드 및 계산 시작
            </button>
          </motion.div>
        )}
      </div>

      {/* 진행률 표시 */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-red-600 p-8"
        >
          <h3 className="text-2xl font-black text-black mb-6">
            3단계: 계산 진행 중
          </h3>

          {/* 진행률 바 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-bold text-black mb-3">
              <span>전체 진행률</span>
              <span className="text-red-600 font-black">{progress}%</span>
            </div>
            <div className="w-full border-2 border-gray-200 h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="bg-red-600 h-full"
              />
            </div>
          </div>

          {/* 현재 작업 */}
          <div className="border-l-4 border-red-600 bg-red-50/50 pl-4 py-3 mb-4">
            <p className="text-sm font-bold text-black">
              {currentItem || '처리 중...'}
            </p>
            <p className="text-xs font-semibold text-gray-600 mt-1">
              {completedItems} / {totalItems} 항목 완료
            </p>
          </div>

          {/* 예상 소요 시간 */}
          {totalItems > 0 && (
            <div className="text-sm font-medium text-gray-700">
              예상 소요 시간: {totalItems < 10 ? '10초' : totalItems < 50 ? '1분' : '2분'} 이내
            </div>
          )}

          {/* 애니메이션 인디케이터 */}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-600">
              백엔드에서 병렬 처리 중...
            </span>
          </div>
        </motion.div>
      )}

      {/* 완료 결과 */}
      {results && !uploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-4 border-green-600 p-8"
        >
          <h3 className="text-2xl font-black text-black mb-4">
            업로드 완료!
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-gray-200 bg-white p-4">
              <p className="text-sm font-bold text-gray-600 mb-1">총 Alternative</p>
              <p className="text-3xl font-black text-black">{results.total || 0}개</p>
            </div>
            <div className="border-2 border-gray-200 bg-white p-4">
              <p className="text-sm font-bold text-gray-600 mb-1">성공</p>
              <p className="text-3xl font-black text-green-600">{results.success || 0}개</p>
            </div>
            <div className="border-2 border-gray-200 bg-white p-4">
              <p className="text-sm font-bold text-gray-600 mb-1">실패</p>
              <p className="text-3xl font-black text-red-600">{results.failed || 0}개</p>
            </div>
          </div>

          <button
            onClick={onSuccess}
            className="mt-6 border-2 border-green-600 bg-green-600 text-white px-8 py-3 text-sm font-bold hover:bg-green-700 transition-colors duration-150"
          >
            확인
          </button>
        </motion.div>
      )}

      {/* 에러 메시지 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border-l-4 border-red-600 bg-red-50 pl-4 py-4"
          >
            <div className="flex justify-between items-center">
              <p className="text-base font-bold text-red-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 사용 가이드 */}
      <div className="border-2 border-blue-200 bg-blue-50 p-6">
        <h4 className="text-base font-black text-black mb-3">
          사용 방법
        </h4>
        <ol className="space-y-2 text-sm font-semibold text-gray-800">
          <li className="flex gap-3">
            <span className="font-black text-black">1.</span>
            <span>템플릿 다운로드 버튼 클릭</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black text-black">2.</span>
            <span>Excel에서 Alternative 데이터 입력 (최대 100개)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black text-black">3.</span>
            <span>작성한 파일을 드래그 또는 선택</span>
          </li>
          <li className="flex gap-3">
            <span className="font-black text-black">4.</span>
            <span>업로드 시작 → 자동 계산 (50개 약 2분)</span>
          </li>
        </ol>

        <div className="mt-4 pt-4 border-t-2 border-blue-200">
          <p className="text-xs font-semibold text-blue-800">
            병렬 계산으로 50개 Alternative를 2분 이내 처리합니다
          </p>
        </div>
      </div>
    </div>
  )
}

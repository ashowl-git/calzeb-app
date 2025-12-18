// CalZEB API Client
// Backend API 호출 함수 (JWT 토큰 지원)

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/calzeb'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('로그인이 필요합니다')
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

/**
 * Handle API response with auth error checking
 */
async function handleResponse(response: Response, errorMessage: string) {
  if (response.status === 401) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
    throw new Error('로그인이 필요합니다')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: errorMessage }))
    throw new Error(error.detail || errorMessage)
  }

  return response.json()
}

// ============================================================================
// 프로젝트 관리 API
// ============================================================================

export async function getProjects(params?: { sort?: string; order?: string; limit?: number }) {
  const queryString = params ? new URLSearchParams(params as any).toString() : ''
  const url = queryString ? `${API_BASE_URL}/projects?${queryString}` : `${API_BASE_URL}/projects`

  const response = await fetch(url, {
    headers: getAuthHeaders()
  })

  return handleResponse(response, '프로젝트 목록 조회 실패')
}

export async function getProject(projectId: number) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    headers: getAuthHeaders()
  })

  return handleResponse(response, '프로젝트 조회 실패')
}

export async function createProject(data: any) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })

  return handleResponse(response, '프로젝트 생성 실패')
}

// ============================================================================
// 계산 API (인증 선택적)
// ============================================================================

export async function calculateSimple(data: any) {
  // 간편 계산은 인증 없이도 가능
  const response = await fetch(`${API_BASE_URL}/calculate-simple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || '계산 실패')
  }

  return response.json()
}

export async function createAlternative(projectId: number, altData: any) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/alternatives`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(altData)
  })

  return handleResponse(response, 'Alternative 추가 실패')
}

export async function getAlternatives(projectId: number) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/alternatives`, {
    headers: getAuthHeaders()
  })

  return handleResponse(response, 'Alternative 목록 조회 실패')
}

export async function updateAlternative(projectId: number, altId: number, altData: any) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/alternatives/${altId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(altData)
  })

  return handleResponse(response, 'Alternative 편집 실패')
}

export async function deleteAlternative(projectId: number, altId: number) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/alternatives/${altId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })

  return handleResponse(response, 'Alternative 삭제 실패')
}

// ============================================================================
// Excel 템플릿 다운로드
// ============================================================================

export async function downloadExcelTemplate(mode: 'simple' | 'detailed' = 'simple') {
  const templateName = mode === 'simple'
    ? 'calzeb_alternatives_simple_template.xlsx'
    : 'calzeb_alternatives_detailed_template.xlsx'

  const url = `${API_BASE_URL}/templates/${templateName}`

  const response = await fetch(url, {
    headers: getAuthHeaders()
  })

  if (!response.ok) throw new Error('템플릿 다운로드 실패')

  // Blob으로 다운로드
  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = templateName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}
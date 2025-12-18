// 회원가입 페이지
// JWT 기반 인증 시스템

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }

    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || '회원가입에 실패했습니다')
      }

      // 토큰 저장 (자동 로그인)
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('username', data.username)
      localStorage.setItem('email', data.email)

      // 홈페이지로 이동
      router.push('/')

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('회원가입 중 오류가 발생했습니다')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-4xl font-black text-black">회원가입</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            CalZEB 계산기 이용을 위한 계정 생성
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border-2 border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700">
                사용자명
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full border-2 border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border-2 border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                placeholder="최소 6자 이상"
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-bold text-gray-700">
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="mt-1 block w-full border-2 border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                placeholder="비밀번호 재입력"
              />
            </div>
          </div>

          {error && (
            <div className="border-2 border-red-600 bg-red-50 text-red-600 px-4 py-3 text-sm font-semibold">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-red-600 bg-red-600 text-white px-4 py-3 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? '회원가입 중...' : '회원가입'}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                로그인
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
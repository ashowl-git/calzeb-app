// 로그인 페이지
// JWT 기반 인증 시스템

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || '로그인에 실패했습니다')
      }

      // 토큰 저장
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
        setError('로그인 중 오류가 발생했습니다')
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
          <h2 className="text-center text-4xl font-black text-black">로그인</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            CalZEB 계산기 이용을 위해 로그인해주세요
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
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border-2 border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                placeholder="••••••••"
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
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/register" className="font-medium text-red-600 hover:text-red-500">
                회원가입
              </Link>
            </div>
            <div className="text-sm">
              <Link href="/" className="font-medium text-gray-600 hover:text-gray-500">
                홈으로
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
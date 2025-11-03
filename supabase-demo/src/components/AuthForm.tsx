'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type AuthMode = 'login' | 'signup'

interface AuthFormProps {
  mode: AuthMode
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signup') {
        // 注册
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback?type=signup&next=/dashboard`, // ✅ 添加 type=signup
          },
        })

        if (error) throw error

        if (data.user) {
          setMessage({
            type: 'success',
            text: '注册成功！请检查您的邮箱以验证账户。',
          })
          // 可选：延迟后跳转到登录页
          setTimeout(() => router.push('/auth/login'), 3000)
        }
      } else {
        // 登录
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            // 设置 session 持久化
            persistSession: true,
          },
        })

        if (error) throw error

        if (data.user) {
          setMessage({
            type: 'success',
            text: '登录成功！正在跳转...',
          })
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || '操作失败，请重试',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === 'signup' ? '注册账户' : '登录'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码
            </label>
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  忘记密码？
                </a>
              </div>
            )}

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">密码至少 6 个字符</p>
            )}
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '处理中...' : mode === 'signup' ? '注册' : '登录'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'signup' ? '已有账户？' : '还没有账户？'}
            <a
              href={mode === 'signup' ? '/auth/login' : '/auth/signup'}
              className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
            >
              {mode === 'signup' ? '去登录' : '去注册'}
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}

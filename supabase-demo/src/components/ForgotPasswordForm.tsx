'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // ✅ 使用完整的回调 URL - 确保使用当前的origin和端口
      const currentOrigin = window.location.origin
      const redirectTo = new URL('/auth/callback', currentOrigin)
      redirectTo.searchParams.set('type', 'recovery')
      // 使用 state 参数来增加安全性
      const state = btoa(JSON.stringify({
        timestamp: Date.now(),
        type: 'recovery'
      }))
      redirectTo.searchParams.set('state', state)

      console.log('📧 发送重置邮件到:', email)
      console.log('🔗 回调 URL:', redirectTo.toString())

      // ✅ 支持PKCE流程的密码重置
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo.toString(),
        captchaToken: undefined, // 如果需要验证码可以在这里添加
      })

      if (error) {
        console.error('❌ 发送失败:', error)
        throw error
      }

      console.log('✅ 邮件发送成功')

      setMessage({
        type: 'success',
        text: '密码重置邮件已发送！请检查您的邮箱（包括垃圾邮件文件夹）。',
      })
      setEmail('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发送失败，请重试'
      setMessage({
        type: 'error',
        text: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">忘记密码？</h2>
          <p className="text-sm text-gray-600 mt-2">
            输入您的邮箱地址，我们将向您发送重置密码的链接
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱地址
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
            >
              <p className="font-medium">
                {message.type === 'error' ? '❌ 错误' : '✅ 成功'}
              </p>
              <p>{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? '发送中...' : '发送重置邮件'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            href="/auth/login"
            className="block text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 返回登录
          </Link>
          <p className="text-xs text-gray-500">
            没有收到邮件？请检查垃圾邮件文件夹
          </p>
        </div>
      </div>
    </div>
  )
}

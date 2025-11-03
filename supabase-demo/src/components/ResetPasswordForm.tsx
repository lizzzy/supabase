'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 密码强度检查
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return { strength: 'weak', color: 'red', text: '弱' }
    if (pwd.length < 10) return { strength: 'medium', color: 'yellow', text: '中' }
    if (pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)) {
      return { strength: 'strong', color: 'green', text: '强' }
    }
    return { strength: 'medium', color: 'yellow', text: '中' }
  }

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // 验证密码
    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: '密码长度至少为 6 个字符',
      })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: '两次输入的密码不一致',
      })
      setLoading(false)
      return
    }

    try {
      // 验证会话状态
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('会话已过期，请重新发起密码重置')
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      // 成功后清除会话
      await supabase.auth.signOut()

      setMessage({
        type: 'success',
        text: '密码重置成功！正在跳转到登录页...',
      })

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push('/auth/login?message=password_reset_success')
        router.refresh()
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '重置失败，请重试'
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
        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">设置新密码</h2>
          <p className="text-sm text-gray-600 mt-2">
            请输入您的新密码
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 新密码 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              新密码
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="至少 6 个字符"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* 密码强度指示器 */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.color === 'red'
                          ? 'bg-red-500 w-1/3'
                          : passwordStrength.color === 'yellow'
                          ? 'bg-yellow-500 w-2/3'
                          : 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.color === 'red'
                        ? 'text-red-600'
                        : passwordStrength.color === 'yellow'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  建议：至少 10 个字符，包含大小写字母、数字和特殊字符
                </p>
              </div>
            )}
          </div>

          {/* 确认密码 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              确认新密码
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="再次输入密码"
            />
            {/* 密码匹配提示 */}
            {confirmPassword && (
              <p
                className={`text-xs mt-1 ${
                  password === confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {password === confirmPassword ? '✓ 密码匹配' : '✗ 密码不匹配'}
              </p>
            )}
          </div>

          {/* 消息提示 */}
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

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading || password !== confirmPassword || password.length < 6}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                重置中...
              </span>
            ) : (
              '重置密码'
            )}
          </button>
        </form>

        {/* 安全提示 */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">🔒 安全提示：</span>
            重置密码后，您将需要使用新密码重新登录。
          </p>
        </div>
      </div>
    </div>
  )
}

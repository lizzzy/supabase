import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          欢迎使用 Supabase Auth
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Next.js + Supabase 认证示例
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              已登录为: <span className="font-semibold">{user.email}</span>
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              前往仪表板
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              注册
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

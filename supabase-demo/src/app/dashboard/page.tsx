import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 如果没有登录，重定向到登录页
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">仪表板</h1>
            <LogoutButton />
          </div>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-2">用户信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">邮箱</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">用户 ID</p>
                  <p className="font-medium font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">创建时间</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">邮箱验证状态</p>
                  <p className="font-medium">
                    {user.email_confirmed_at ? (
                      <span className="text-green-600">✓ 已验证</span>
                    ) : (
                      <span className="text-yellow-600">⚠ 未验证</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">元数据</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

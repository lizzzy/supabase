import AuthForm from '@/components/AuthForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  // ✅ await searchParams
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {/* 成功消息 */}
        {params.message === 'password_reset_success' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-800 font-medium">
              ✅ 密码重置成功！
            </p>
            <p className="text-sm text-green-700 mt-1">
              请使用新密码登录
            </p>
          </div>
        )}

        {/* 错误消息 */}
        {params.error === 'invalid_link' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-800 font-medium">
              ❌ 重置链接无效或已过期
            </p>
            <p className="text-sm text-red-700 mt-1">
              请重新申请密码重置
            </p>
          </div>
        )}

        {params.error === 'verification_failed' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-800 font-medium">
              ❌ 邮箱验证失败
            </p>
            <p className="text-sm text-red-700 mt-1">
              验证链接可能已过期
            </p>
          </div>
        )}

        <AuthForm mode="login" />
      </div>
    </div>
  )
}

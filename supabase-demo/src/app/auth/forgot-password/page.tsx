import ForgotPasswordForm from '@/components/ForgotPasswordForm'

export const metadata = {
  title: '忘记密码',
  description: '重置您的密码',
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; details?: string }>
}) {
  const params = await searchParams

  const errorMessages: Record<string, { title: string; message: string }> = {
    invalid_link: {
      title: '链接无效',
      message: '重置链接格式错误或不完整',
    },
    missing_code: {
      title: '缺少验证码',
      message: '链接中缺少必要的验证码参数',
    },
    link_expired: {
      title: '链接已过期',
      message: '重置链接已过期（有效期 1 小时），请重新申请',
    },
    link_used: {
      title: '链接已使用',
      message: '此重置链接已经被使用过，请重新申请',
    },
    exchange_failed: {
      title: '验证失败',
      message: '无法验证重置链接，请重新申请',
    },
    unexpected_error: {
      title: '未知错误',
      message: '处理重置请求时发生错误',
    },
    verification_failed: {
      title: '验证失败',
      message: '邮箱验证失败，请重新申请',
    },
  }

  const errorInfo = params.error ? errorMessages[params.error] : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-4">
        {/* 错误提示 */}
        {errorInfo && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  {errorInfo.title}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorInfo.message}</p>
                  {params.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs underline">
                        查看技术详情
                      </summary>
                      <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                        {decodeURIComponent(params.details)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <ForgotPasswordForm />
      </div>
    </div>
  )
}

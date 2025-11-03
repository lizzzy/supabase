import ResetPasswordForm from '@/components/ResetPasswordForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: '重置密码',
  description: '设置新密码',
}

export default async function ResetPasswordPage() {
  const supabase = await createClient()

  // 检查用户是否有有效的 session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 如果没有会话或会话不是恢复模式，说明链接无效
  if (!session || !session.user) {
    console.warn('No valid session found in reset password page')
    redirect('/auth/forgot-password?error=invalid_session')
  }

  // 检查是否是密码重置流程
  const accessToken = session.access_token
  if (!accessToken || !session.user.email) {
    console.warn('Invalid access token or user email')
    redirect('/auth/forgot-password?error=invalid_token')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <ResetPasswordForm />
    </div>
  )
}

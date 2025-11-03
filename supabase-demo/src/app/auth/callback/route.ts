import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthError } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'
    const type = requestUrl.searchParams.get('type')

    console.log('=== Auth Callback ===')
    console.log('URL:', requestUrl.href)
    console.log('Code:', code ? '✅' : '❌')
    console.log('Type:', type)

    // 验证 state 参数
    const state = requestUrl.searchParams.get('state')
    if (state) {
      try {
        const stateData = JSON.parse(atob(state))
        const timestamp = stateData.timestamp
        const stateType = stateData.type

        // 验证时间戳（24小时有效期）
        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
          console.error('❌ State timestamp expired')
          return NextResponse.redirect(`${requestUrl.origin}/auth/forgot-password?error=link_expired`)
        }

        // 验证类型匹配
        if (stateType !== type) {
          console.error('❌ State type mismatch')
          return NextResponse.redirect(`${requestUrl.origin}/auth/forgot-password?error=invalid_link`)
        }
      } catch (_) {
        console.error('❌ Invalid state parameter')
        return NextResponse.redirect(`${requestUrl.origin}/auth/forgot-password?error=invalid_link`)
      }
    }

    if (!code) {
      console.error('❌ No code provided')
      return NextResponse.redirect(`${requestUrl.origin}/auth/forgot-password?error=no_code`)
    }

    const supabase = await createClient()

    try {
      // 先验证当前会话状态
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession) {
        // 如果已经有会话，先登出
        await supabase.auth.signOut()
      }

      // ✅ 使用 exchangeCodeForSession 处理PKCE流程
      console.log('🔄 Attempting to exchange code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Code exchange failed:', error)
        throw error
      }

      console.log('✅ Code exchange successful')
      console.log('Session data:', data?.session ? 'Session exists' : 'No session')
      console.log('User data:', data?.user ? 'User exists' : 'No user')

      // 验证交换结果
      if (!data?.session || !data?.user) {
        console.error('❌ Missing session or user data after exchange')
        throw new Error('Invalid session or user data from code exchange')
      }

      // 根据类型处理重定向
      if (type === 'recovery') {
        if (!data.user) {
          throw new Error('Invalid recovery session')
        }

        // 创建带有用户信息的响应，确保cookie设置正确
        const response = NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)

        // 手动设置必要的cookie以确保session持久化
        if (data.session) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: data.session.expires_in || 3600
          })

          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
          })
        }

        return response
      }

      if (type === 'signup') {
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?message=email_verified`)
      }

      return NextResponse.redirect(`${requestUrl.origin}${next}`)

    } catch (error) {
      if (error instanceof AuthError) {
        console.error('❌ Auth error:', {
          message: error.message,
          status: error.status,
          name: error.name
        })

        if (error.message.includes('expired')) {
          return NextResponse.redirect(`${requestUrl.origin}/auth/forgot-password?error=link_expired`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/auth/forgot-password?error=invalid_link`)
        }
      }

      console.error('❌ Session error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/forgot-password?error=session_error`)
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(`${requestUrl.origin}/auth/forgot-password?error=unexpected_error`)
  }
}

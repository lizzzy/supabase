import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // 确保正确设置cookie，特别是认证相关的cookie
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                // 确保路径设置正确
                path: '/',
              })
            })
          } catch (error) {
            // 在 Server Component 中可能会失败
            // 这是预期行为，中间件会处理
            console.warn('Cookie setting failed in server component:', error)
          }
        },
      },
    }
  )
}

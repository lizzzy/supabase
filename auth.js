import { createClient } from "@supabase/supabase-js";
import 'dotenv/config'
console.log(process);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

let refreshToken = null

// 注册
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (data.session) refreshToken = data.session.refresh_token
  return { success: !error, data, error }
}
// 登录
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (data.session) {
    refreshToken = data.session.refresh_token
    // 如果有 refresh token，调用刷新方法
    if (refreshToken) await refresh()
  }
  return { success: !error, data, error }
}
// 刷新token
export async function refresh(token = refreshToken) {
  if (!token) return { success: false }
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: token })
  if (data.session) refreshToken = data.session.refresh_token
  return { success: !error, data, error }
}
// 登出
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  // 清除存储的 refresh token
  refreshToken = null
  return { success: !error, error }
}
// 获取当前token
export function getRefreshToken() {
  return refreshToken
}

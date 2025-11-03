import { createClient } from "@supabase/supabase-js";
import { signUp, signIn, signOut, refresh, getRefreshToken } from './auth.js'

import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser(data) {
  const { data: result, error } = await supabase // ✅ 解构时重命名为 result
    .from("users")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("创建用户失败:", error);
  } else {
    console.log("创建成功:", result);
    return result;
  }
}

/* createUser({
  username: "张三",
  password: "123456",
  email: "zhangsan@qq.com",
  tel: "010-12345678",
  avatar: "https://www.therapietape.cn/img/cover/2/2.jpg",
  gender: "男",
}); */

async function getUsers() {
  const { data: result, error } = await supabase.from("users").select("*");
  if (error) console.error(error);
  else console.log(result);
}

// getUsers();

async function updateUser(id, data) {
  const { data: result, error } = await supabase
    .from("users")
    .update(data)
    .eq("id", id);
  if (error) console.error(error);
  else console.log(data);
}

// updateUser(1, { password: '11111' });

async function deleteUser(id) {
  const { data: result, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) console.error(error);
  else console.log(result);
}

// deleteUser(2);


/* await signIn('shenjingyibancunzai@gmail.com', '123456')
console.log("当前Refresh token: ", getRefreshToken());
const refreshResult = await refresh()
console.log(refreshResult);
const singOutResult = await signOut()
console.log(singOutResult); */


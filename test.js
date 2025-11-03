// gen-keys
import jwt from 'jsonwebtoken';

const secret = 'your-super-secret-jwt-token-with-at-least-32-characters-long';

const payload = {
  role: 'anon',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 7,
  sub: 'anon-user',
};

/* const anonKey = jwt.sign(payload, secret);
const serviceKey = jwt.sign({ ...payload, role: 'service_role' }, secret);

console.log('ANON_KEY:', anonKey);
console.log('SERVICE_ROLE_KEY:', serviceKey); */
/* 将JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
和ANON_KEY、SERVICE_ROLE_KEY写入到Supabase docker镜像的.env中
docker-compose.yml中开启env配置
services:
  supabase-auth:
    image: supabase/gotrue:v2.180.0
    env_file:
      - .env


进入docker镜像查看env是否起效
docker exec -it supabase-auth /bin/sh
env | grep JWT_SECRET
*/





/*
进入镜像查看是否有数据表
docker exec -it supabase-db psql -U postgres
\dt

postgres=> \dt
        List of relations
 Schema | Name | Type  |  Owner
--------+------+-------+----------
 public | user | table | postgres
(1 row)

有public.user表

*/
const SUPABASE_URL = 'http://192.168.0.51:8000'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTc2MTEzMjk0MywiZXhwIjoxNzYxNzM3NzQzLCJzdWIiOiJhbm9uLXVzZXIifQ.bqykH4mu9S4K0vbeDOSjCiyGNoFjNz8YYM24U7R-fYc'
// 测试远程env
import fetch from 'node-fetch';
async function testServerEnv() {
  try {
    const res = await fetch(`${SUPABASE_URL}/user`, {
      method: 'GET',
      headers: {
        // 不传 Authorization，看容器的 ANON_KEY 是否生效
      },
    });

    const data = await res.json();
    console.log('状态码:', res.status);
    console.log('返回数据:', data);
  } catch (err) {
    console.error('请求异常:', err);
  }
}

// testServerEnv();








// 测试本地连接，关闭RSL 编辑表格 - Enable Row Level Security (RLS)
import { createClient } from '@supabase/supabase-js'

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzYxMTMyOTQzLCJleHAiOjE3NjE3Mzc3NDMsInN1YiI6ImFub24tdXNlciJ9.x-yhxg6Dh5_TCr7pP0idXvvxvJ-7CaP5dtQxD9Hhk2I';
// const supabase = createClient(SUPABASE_URL, ANON_KEY)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY) // 使用超级权限

async function test() {
  const { data, error } = await supabase.from('user').select('*')
  console.log(data, error)
}

test()

// const { data, error } = await supabase.auth.getUser()
// console.log(data, error)


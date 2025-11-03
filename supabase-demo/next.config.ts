import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 强制使用端口3000以匹配Supabase项目配置
  experimental: {
    // 这会确保开发服务器始终尝试使用端口3000
  },

  // 添加重写规则以处理认证回调
  async rewrites() {
    return [
      {
        source: '/auth/callback',
        destination: '/auth/callback',
      },
    ]
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 静态导出模式，用于 Cloudflare Pages 直接托管
  output: 'export',
  // 静态导出时禁用图片优化（无服务端运行时）
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;

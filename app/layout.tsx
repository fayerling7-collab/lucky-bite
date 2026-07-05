import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/appStore';

export const metadata: Metadata = {
  title: 'Lucky Bite - 幸运扭蛋美食',
  description: '用扭蛋游戏帮朋友们决定今天吃什么，把每一次聚餐变成幸运抽取仪式',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lucky Bite',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/icon-192.svg', sizes: '192x192' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#A8D8F0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lucky Bite" />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

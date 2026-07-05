import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/appStore';
import { SWRegister } from '@/components/pwa/SWRegister';

export const metadata: Metadata = {
  title: 'Lucky Bite - 幸运扭蛋美食',
  description: '用扭蛋游戏帮朋友们决定今天吃什么，把每一次聚餐变成幸运抽取仪式',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '幸运扭蛋',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-192.svg', sizes: '192x192' },
      { url: '/icons/icon-512.svg', sizes: '512x512' },
    ],
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="幸运扭蛋" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.svg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.svg" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.svg" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
        <SWRegister />
      </body>
    </html>
  );
}

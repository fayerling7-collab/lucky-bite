// Lucky Bite Service Worker - PWA 离线缓存与全屏体验
const CACHE_NAME = 'lucky-bite-v3';
const APP_SHELL = [
  '/',
  '/ranking',
  '/diary',
  '/restaurant/new',
  '/party',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-maskable.svg',
];

// 安装：预缓存应用外壳
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// 接收 SKIP_WAITING 消息，快速激活新版本
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// fetch 事件处理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Next.js HMR、API 路由、tesseract worker 不缓存
  if (
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('tesseract') ||
    url.pathname.includes('worker') ||
    url.hostname !== location.hostname
  ) {
    return;
  }

  // 导航请求：网络优先，失败回退缓存（保证离线也能打开）
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match('/'))
        )
    );
    return;
  }

  // 静态资源：缓存优先
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((res) => {
            if (res.ok && (res.type === 'basic' || res.type === 'cors')) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return res;
          })
          .catch(() => cached)
      );
    })
  );
});

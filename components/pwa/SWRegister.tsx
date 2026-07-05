'use client';

import { useEffect } from 'react';

/**
 * 客户端注册 Service Worker，启用 PWA 离线缓存与全屏 standalone 体验。
 * 仅在生产环境注册，避免开发环境 HMR 冲突。
 */
export function SWRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // 仅在 https 或 localhost 下注册
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // 监听更新提示
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 有新版本，静默激活，下次刷新生效
                newWorker.postMessage?.('SKIP_WAITING');
              }
            });
          });
        })
        .catch(() => {
          // 注册失败不影响主流程
        });
    };

    // 页面 load 后再注册，避免抢占首屏资源
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}

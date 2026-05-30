import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&family=Noto+Sans+JP:wght@400;700&family=M+PLUS+Rounded+1c:wght@700&display=swap"
          rel="stylesheet"
        />

        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#1CB0F6" />
        <meta name="application-name" content="andokensaku" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="andokensaku" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: baseColorCss }} />

        <script dangerouslySetInnerHTML={{ __html: swRegistration }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// 初期描画（JS ハイドレーション前）のチラつき防止。OS のカラー設定に追従し、
// アプリ起動後は ThemeProvider がユーザー設定で上書きする。
const baseColorCss = `
:root { background-color: #F7F7F7; color: #3C3C3C; color-scheme: light dark; }
body { background-color: #F7F7F7; color: #3C3C3C; }
@media (prefers-color-scheme: dark) {
  :root { background-color: #131F24; color: #F1F7FB; }
  body { background-color: #131F24; color: #F1F7FB; }
}
`;

// 開発時の SW キャッシュ事故を防ぐため、本番ホストでのみ登録する。
// localhost / 127.0.0.1 / file: で開かれた場合は登録せず、既存の SW があれば
// 解除してキャッシュもクリアする。
const swRegistration = `
(function () {
  if (!('serviceWorker' in navigator)) return;
  var host = location.hostname;
  var isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '' ||
    host.endsWith('.local');
  if (isLocal) {
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      regs.forEach(function (r) { r.unregister(); });
    });
    if (window.caches && caches.keys) {
      caches.keys().then(function (keys) {
        keys.forEach(function (k) { caches.delete(k); });
      });
    }
    return;
  }
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      console.warn('SW registration failed:', err);
    });
  });
})();
`;

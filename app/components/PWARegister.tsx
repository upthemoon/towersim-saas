"use client";

import { useEffect } from "react";

/**
 * Service Worker を登録するクライアントコンポーネント。
 * - 本番のみ登録 (dev では HMR と競合するため無効化)
 * - SW が更新された場合は次回ロードで自動入れ替え (skipWaiting + clients.claim)
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // 登録失敗してもアプリ機能は影響なし
        });
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}

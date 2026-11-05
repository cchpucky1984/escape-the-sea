'use strict';
/* =========================================================
   sw.js — PWA Service Worker（v0.11，cache-first 離線可玩）
   ---------------------------------------------------------
   為什麼在 js/ 但用根目錄 loader 註冊：
     Service Worker 的 scope 只能是「腳本所在目錄」；本機用 python http.server，
     它不會送 Service-Worker-Allowed header，所以 js/sw.js 只能控制 /js/*。
     解法：根目錄 `sw.js` 只有一行 `importScripts('js/sw.js')`（scope＝/），
     真正邏輯全部留在這個檔案；由 B 在 main.js 註冊 `sw.js`。
   策略（2026-11-04 依 B 的「QA 前要清 SW」提醒調整）：
     - 版本 `etsea-v0.11.0`；install 逐項 precache（單項 404 不影響整體）
     - activate 清掉舊版本快取＋clients.claim()
     - **本機開發環境（localhost/127.0.0.1）改用 network-first**：線上永遠拿最新檔，
       離線才回快取 → v0.7 QA 不必手動清 SW / bypass
     - **正式環境**：cache-first＋背景 revalidate；導覽請求 network-first（新 index 才看得到新版）
     - 任何部署都要同步 bump `VERSION`（換快取）與 index.html 的 `?v=`（換檔名）
     - 開發/QA 一鍵清：`navigator.serviceWorker.controller.postMessage({type:'sw-clear'})`
   ========================================================= */

var VERSION = 'etsea-v0.11.0';
var SCOPE = (self.registration && self.registration.scope) || self.location.href.replace(/[^/]*$/, '');
/* 本機＝開發環境：network-first，避免 cache-first 讓 QA 拿到舊 core/style */
var DEV = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(self.location.hostname);

var PRECACHE = [
  /* 入口與樣式 */
  'index.html',
  'style.css',
  'manifest.webmanifest',
  /* 程式（順序同 index.html） */
  'js/core.js',
  'docs/i18n/STRINGS.js',
  'js/fx.js',
  'js/base.js',
  'js/sea.js',
  'js/leviathan.js',
  'js/events.js',
  'js/space.js',
  'js/main.js',
  'js/touch.js',
  /* 音檔（B/C 產出的程序合成配樂） */
  'docs/audio/sea-a.mp3',
  'docs/audio/sea-b.mp3',
  'docs/audio/launch-a.mp3',
  'docs/audio/launch-b.mp3',
  'docs/audio/boss-a.mp3',
  'docs/audio/boss-b.mp3',
  /* 標題美術＋PWA 圖示 */
  'docs/art/title-art/title-1280x800.webp',
  'docs/art/title-art/title-1920x1080.webp',
  'docs/art/pwa/icon-192.png',
  'docs/art/pwa/icon-512.png',
  'docs/art/pwa/icon-maskable-192.png',
  'docs/art/pwa/icon-maskable-512.png',
  'docs/art/pwa/apple-touch-icon-180.png',
  'docs/art/pwa/favicon-32.png'
].map(function (p) { return new URL(p, SCOPE).href; });

var INDEX_URL = new URL('index.html', SCOPE).href;

/* ---------------- install：逐項 precache（缺檔不讓整個安裝失敗） ---------------- */
self.addEventListener('install', function (event) {
  event.waitUntil((async function () {
    var cache = await caches.open(VERSION);
    await Promise.all(PRECACHE.map(async function (url) {
      try {
        var res = await fetch(url, { cache: 'reload' });
        if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res);
      } catch (e) { /* 單項失敗（例如該輪還沒產生的音檔）不影響安裝 */ }
    }));
    if (self.skipWaiting) await self.skipWaiting();
  })());
});

/* ---------------- activate：清舊快取＋立刻接管 ---------------- */
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.map(function (k) {
      if (k !== VERSION) return caches.delete(k);
      return null;
    }));
    if (self.clients && self.clients.claim) await self.clients.claim();
    /* 通知已開的分頁：新版本就緒（main.js 可選用，不依賴） */
    try {
      var list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (var i = 0; i < list.length; i++) list[i].postMessage({ type: 'sw-activated', version: VERSION });
    } catch (e) { }
  })());
});

/* ---------------- fetch：dev＝network-first；prod＝cache-first（導覽 network-first） ---------------- */
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (!req || req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  event.respondWith((async function () {
    var cache = await caches.open(VERSION);
    var keyUrl = url.origin + url.pathname;   /* 快取鍵去掉 ?v=，避免每版多一份 */

    function cached() {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return cache.match(INDEX_URL, { ignoreSearch: true });
        return null;
      });
    }
    function offlineResponse() {
      return new Response('offline', {
        status: 503, statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    /* 本機開發：先網路、失敗才回快取（QA 永遠看到最新檔案，離線仍可開） */
    if (DEV) {
      try {
        var fresh = await fetch(req, { cache: 'no-store' });
        if (fresh && (fresh.ok || fresh.type === 'opaque') && !req.headers.get('range')) {
          cache.put(keyUrl, fresh.clone()).catch(function () { });
        }
        return fresh;
      } catch (err) {
        var hitDev = await cached();
        if (hitDev) return hitDev;
        return offlineResponse();
      }
    }

    /* 正式環境：導覽 network-first（新 index 才帶得到新版 ?v=），其他 cache-first＋背景 revalidate */
    if (req.mode === 'navigate') {
      try {
        var net = await fetch(req);
        if (net && net.ok) cache.put(keyUrl, net.clone()).catch(function () { });
        return net;
      } catch (err) {
        var idx = await cached();
        if (idx) return idx;
        return offlineResponse();
      }
    }

    var hit = await cache.match(req, { ignoreSearch: true });
    if (hit) {
      /* 背景更新快取（stale-while-revalidate），下次載入即為新版 */
      fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) cache.put(keyUrl, res.clone()).catch(function () { });
      }).catch(function () { });
      return hit;
    }
    try {
      var res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque') && !req.headers.get('range')) {
        cache.put(keyUrl, res.clone()).catch(function () { });
      }
      return res;
    } catch (err2) {
      var idx2 = await cached();
      if (idx2) return idx2;
      return offlineResponse();
    }
  })());
});

/* ---------------- 開發/QA 一鍵清（page → controller.postMessage({type:'sw-clear'})） ---------------- */
self.addEventListener('message', function (event) {
  var data = event.data || {};
  if (data.type !== 'sw-clear') return;
  event.waitUntil((async function () {
    try {
      var ks = await caches.keys();
      for (var i = 0; i < ks.length; i++) { try { await caches.delete(ks[i]); } catch (e) { } }
    } catch (e) { }
    try {
      var list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (var j = 0; j < list.length; j++) list[j].postMessage({ type: 'sw-cleared', version: VERSION });
    } catch (e) { }
    try { await self.registration.unregister(); } catch (e) { }
  })());
});

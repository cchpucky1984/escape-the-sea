/* =========================================================
   sw.js（根目錄 loader，v0.7）
   ---------------------------------------------------------
   python http.server 不會送 Service-Worker-Allowed，Service Worker
   的 scope 只能等於「腳本所在目錄」。要控制整個網站（含 index.html），
   註冊本檔（/sw.js → scope '/'），再由它載入 js/sw.js 的完整邏輯。
   註冊（B 在 main.js 加）：navigator.serviceWorker.register('sw.js')
   ========================================================= */
importScripts('js/sw.js');

# 存檔 fixture（給 S1a 存檔遷移測試用）

檔案：
- `save-v1.json`：舊版（`escape-the-sea-v1`，只有 `mod` 數量表，沒有 base.structures）
- `save-v2.json`：現行 `escape-the-sea-v2` payload（9 座建築、3 件零件、已領 3 任務）

用法（在瀏覽器 console 或 CDP `Runtime.evaluate`）：

```js
// 載入 v1：先清乾淨，再寫舊 key，reload 後按「繼續遊戲」
localStorage.clear();
localStorage.setItem('escape-the-sea-v1', JSON.stringify(<save-v1.json 內容>));
location.reload();

// 載入 v2
localStorage.clear();
localStorage.setItem('escape-the-sea-v2', JSON.stringify(<save-v2.json 內容>));
location.reload();
```

驗收要看的：
1. v2 載入後資源／升級／9 座建築／3 件零件都還在，平台格不重疊（`baseTiles().length === 10`）。
2. v1 載入後建築由 `mod` 重建、格子不重疊（目前 `migrateV1` 會重疊，見 AUDIT P2-2，S1a 順手修）。
3. 載入後 `saveGame()` 寫回的 payload 有 `v` 欄位（v3）。

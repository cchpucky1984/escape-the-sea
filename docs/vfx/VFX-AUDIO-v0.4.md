# 逃出大海 · VFX／音效系統設計 v0.4

> 成員 D（技術美術／助理程式）· Sprint S0 交付
> S1 擁有範圍：`js/base.js`、`js/space.js`、新檔 `js/fx.js`
> 原型：`docs/vfx/vfx-demo.html`（自包含、可點擊、可 headless 截圖）
> 截圖：`_shots\D\`（`demo-00`~`demo-04` 為原型，`game-01`~`game-04` 為現況）

## 0. 結論（先看這段）

現有回饋「有，但不夠爽」，三個根因：

1. **沒有頓幀**：全專案 0 處 hitstop／timeScale，命中與擊殺在時間軸上沒有重量差。
2. **回饋各自為政**：`sea.shake`／`L.shake`／`M.shake` 三套（衰減 22／26／24 px/s，上限 10／16／20／22／26）；閃白用「逐幀 −0.05」衰減（`space.js:354`、`:770`），FPS 高時閃得比設計快。
3. **粒子每幀配置**：`sea.parts` 用 `push` ＋ `filter`（`sea.js:597-608`），粒子多就 GC 抖動；只有圓點一種形狀，沒有火花、衝擊環、拖尾。

方案：新增 `js/fx.js`（物件池 ＋ 螢幕效果 ＋ 音效表），全遊戲只留 **3 類接線點**。S1 先做三個最有感的效果：**海面命中火花**（§1 #1）、**擊殺爆散＋40ms 頓幀**（#2）、**月球核心受擊**（#8）。

## 1. 現況盤點（file:line）

| 事件 | 現有回饋 | 診斷 |
|---|---|---|
| 海面命中 | 3 顆白點 `sea.js:242`、目標白閃 `:227,916-945`、傷害飄字 `:228` | 沒聲音、沒震動、沒環，像戳氣泡 |
| 海面擊殺 | 10–16 顆圓點 `:232`、震動 +3（上限 10）`:240`、`sfx('boom')` `core.js:100` | `boom` 是 0.4s 噪音，連殺時糊成一團；無頓幀 |
| 玩家受傷 | 震動 +7（上限 16）`:133`、`sfx('hurt')` `core.js:99`、紅字 `:135`、8 顆粒子 `:136` | 缺全螢幕紅閃與頓幀，痛感不足 |
| 拾取資源 | 飄字 `:189`、`sfx('pick')` `core.js:96` | 合格，S1 不動 |
| 建造完成 | 18 顆粒子＋震動 +3 `base.js:59-66`、`sfx('build')` `core.js:101` | 缺「蓋好了」的收束感（環＋閃光） |
| 砲塔開火 | 砲口 glow 0.12s `base.js:204,603-609`、光束 0.16s `:206`、`tone 920→460` `:207` | 音效太細、無後座力 |
| 升空受擊 | 震動 +10（上限 20）`space.js:78`、閃白 0.6 逐幀衰減 `:79,351-354`、`boom` `:80` | 閃白長度隨 FPS 變；無鏡頭衝擊 |
| 月球 Boss 受擊 | 白閃 0.12s `space.js:1130`、繪製 `:1536` | **完全沒有震動／音效／粒子**，像打在棉花上 |
| 衛星光束 | 屏震 26 `:1087`、光束繪製 `:1357-1398`、單次 `boom` `:1089` | 視覺有，但無白閃、頓幀、慢動作 |
| 核心爆炸／通關 | 40 顆擴散彈 `:897-900`、`sfx('win')` `core.js:103` | 不夠史詩 |

## 2. `fx` 模組 API（可直接搬進 `js/fx.js`）

載入順序：`core.js` → **`fx.js`** → `base.js` → …（`index.html` 屬 C，需 Lead 協調加一行 `<script src="js/fx.js?v=0.4.0"></script>`）。
`fx` 只依賴 core.js 既有全域：`ctx, VW, VH, DPR, rnd, clamp, tone, noiseHit, AC, master, muted`。

| API | 參數 | 說明 |
|---|---|---|
| `fx.update(rawDt)` | `rawDt` 真實秒數 | **回傳世界 dt**：頓幀回 0、慢動作回 `raw×scale`；螢幕層一律用 raw 衰減 |
| `fx.drawWorld()` | – | 在相機／震動 transform **內**呼叫（世界座標） |
| `fx.drawScreen()` | – | 每幀最後一次（閃光、暗角） |
| `fx.burst(x,y,o)` | `{n,spd:[a,b],life:[a,b],size:[a,b],col,drag,grav,dir,spread,a}` | 光點爆發 |
| `fx.spark(x,y,o)` | 同上 + `tail`（拖尾秒數，預設 0.035） | 速度對齊火花線，命中感主力 |
| `fx.trail(x,y,o)` | `{vx,vy,tx,ty,life,size,col,a}` | 短命拖尾（魚叉、尾焰） |
| `fx.ring(x,y,o)` | `{r0,r1,life,w,col,fill}` | 衝擊環 |
| `fx.text(x,y,s,o)` | `{col,size,rise,life}` | 飄字／傷害數字 |
| `fx.beam(x1,y1,x2,y2,o)` | `{life,w,col}` | 光束（帶電弧抖動） |
| `fx.shake(px,ms)` | – | 螢幕震動（取 max，不合併） |
| `fx.shakeOffset()` | – | 回傳 `{x,y}`（每幀算一次，物件重用） |
| `fx.flash(css,a,ms)` | – | 全螢幕閃光（顏色字串 + alpha + 時長） |
| `fx.hitstop(ms)` / `fx.slowmo(scale,ms)` | – | 頓幀／慢動作 |
| `fx.sfx(name)` | 見 §4 | 9 個新音效事件 |
| `fx.stats()` / `fx.reset()` / `fx.setTier(n)` | – | 除錯、切場景清空、強制降級 |

**接線（S1 共 3 類）**

```js
// 1) main.js:259-267（B）—— 取代原本的 const dt
const raw = Math.min(0.05, (now - lastT) / 1000); lastT = now;
const dt = fx.update(raw);
…（維持原本 updateSea(dt) 等呼叫）…
fx.drawScreen();                       // 場景 draw 之後、rAF 之前

// 2) sea.js:691-694（B）、space.js:211-214（升空）、space.js:1188-1192（月球）（D）
const sh = fx.shakeOffset();
ctx.translate(-cam.x + sh.x, -cam.y + sh.y);   // 原本的 shx/shy 換成這行
fx.drawWorld();                                 // 在該 transform 內、粒子之前

// 3) 命中點改用 fx（例：sea.js:240）
fx.shake(6, 180); fx.flash('#ffffff', 0.12, 160); fx.hitstop(40); fx.sfx('kill');
```

同時**刪除**：三套 shake 狀態與更新（`sea.js:414`、`space.js:60,497,961`）、逐幀 flash 衰減（`space.js:354,770`）、`sea.parts.filter`（`sea.js:597-608`）。

**資料結構（固定長度物件池，永不重新配置）**

| 池 | 上限（tier1） | 欄位 |
|---|---|---|
| `part` | 900 | x,y,vx,vy,tvx,tvy,life,life0,size,size1,drag,grav,a0,col,streak |
| `ring` | 40 | x,y,r0,r1,life,life0,w,col,fill |
| `text` | 48 | x,y,vy,life,life0,size,col,font,text |
| `beam` | 24 | x1,y1,x2,y2,life,life0,w,col,t,seed |

回收：游標覆寫 `pCur=(pCur+1)%cap`，最舊的自動被蓋掉；**不用 `push`／`filter`／`splice`**，每幀固定掃 `cap` 格（900 次屬性讀取 ≈0.03ms）。
防 GC 四招：①顏色用「8 色 × 16 級 alpha」預算字串表（init 一次，128 個）；②光暈用預渲染 64px sprite `drawImage`，**禁用 `shadowBlur`**；③字型字串在 emit 時組一次；④HUD 計數 4Hz 更新。

## 3. 打擊感規格（具體數字）

| 事件 | 震動 | 頓幀 | 慢動作 | 閃光 | 粒子 | 環 |
|---|---|---|---|---|---|---|
| 一般命中 | 2.5px / 80ms | 0 | – | `#fff` α0.05 / 90ms | 14 光點＋18 火花＋6 金點 | 4→46px / 280ms |
| 擊殺 | 6px / 180ms | 40ms | 0.55× / 200ms | `#fff` α0.12 / 160ms | 24 碎片＋14 紫點＋18 火花 | 12→96px 雙環 |
| 玩家受傷 | 9px / 260ms | 90ms | – | `#ff4050` α0.18 / 160ms | 10 紅點＋8 火花 | 8→52px |
| Boss 核心受擊 | 8px / 200ms | 45ms | – | 核心 additive 0.55 / 120ms | 16 紫＋10 火花 | 18→96px / 380ms |
| 衛星光束 | 26px / 700ms | 160ms | 0.25× / 260ms | `#fff` α0.42 / 300ms | 70 藍＋36 金＋22 火花 | 3 環 26→300px |
| 升空點火 | 3px / 250ms | – | – | 橙 α0.14 / 700ms | 2 顆 / 12ms（grav 170） | 20→200px 水氣環 |
| 建造完成 | 3px / 90ms | 0 | – | 金 α0.10 / 120ms | 10 金點 | 8→60px / 260ms |

- **震動公式**：`a(t) = A·e^(−4.6t/T)`，`offset = rnd(−a, a)` 兩軸獨立；同幀多次取 **max** 不疊加；全域上限 **26px**。
- **頓幀**：世界 `dt=0`，特效以 `0.35×raw` 繼續推進（畫面不死板）；單次 ≤**220ms**，同一秒累計 ≤**350ms**（防連打卡死）。射擊／移動不停頓，只有命中與受擊停。
- **閃光**：一律用真實時間線性衰減，禁止逐幀遞減。
- **後座力**：魚槍槍口火光 0.05s＋角色位移 3px（90ms 回復）＋準心擴散 +8px；砲塔砲管沿射線後退 4px（90ms 回復）；火箭船體 ±1.5px 抖動、尾焰 pulse 80ms 週期。
- **Boss 分階段**：100%→50% 受擊 8px/200ms；50%→10% 改 10px 且每 3 次命中補一次 `heavy`；<10% 進入光束終結（26px＋160ms＋0.25×）。

## 4. 音效規格（WebAudio 合成，無音檔）

沿用 core.js 的 `tone()`／`noiseHit()`（`core.js:68-93`）；新增事件走 `fx.sfx()`。**與現有 `sfx()` 整合**：B 在 `core.js:111` 的 `switch` 尾端加一行
`default: if (window.fx && fx.sfx) fx.sfx(n); break;`

| 事件 | 合成參數（波形／頻率掃描／包絡／濾波／時長／音量） | 用途 |
|---|---|---|
| `hit` | square 250→110Hz 45ms v.055 ＋ noise 2800Hz 50ms v.09 | 一般命中 |
| `crit` | triangle 900→1500Hz 45ms ＋ 16ms 後 sine 1350→2100Hz 40ms | 穿透／爆擊 |
| `kill` | noise 1500Hz 160ms v.15 ＋ triangle 320→80Hz 140ms v.07 | 擊殺 |
| `heavy` | sine 72→34Hz 300ms v.20 ＋ saw 160→50Hz（lowpass 420）220ms ＋ noise 520Hz 200ms | 配頓幀的重擊 |
| `core` | square 620→300Hz 60ms v.075 ＋ sine 95→62Hz 200ms v.13 | Boss 核心受擊 |
| `crack` | noise 4200Hz 120ms v.16 ＋ triangle 1800→420Hz 90ms | 護盾破裂 |
| `charge` | saw 110→760Hz（lowpass 1400）1.0s ＋ sine 55→58Hz 1.0s | 衛星鎖定集氣 |
| `beam` | saw 1900→90Hz（lowpass 2600）650ms ＋ noise 1100Hz 750ms ＋ sine 45Hz 1.1s | 光束命中 |
| `ignite` | noise 360Hz 1.1s v.20 ＋ saw 62→28Hz（lowpass 220）1.0s | 升空點火 |

包絡統一：`gain 0.0001 →（+12ms）vol →（dur）0.0001`，`osc.stop(dur+30ms)`；master 維持 0.22（`core.js:44`）。
混音規則：同名 **35ms 去重**、每幀最多 **3 個**新音源、同時發聲 ≤12；命名沿用 core.js 的單字小寫慣例。

## 5. 效能預算與行動裝置降級

| 項目 | tier1 桌上 | tier2 手機 | tier3 低階 |
|---|---|---|---|
| 粒子上限 | 900 | 380 | 180 |
| 環 / 飄字 / 光束 | 40 / 48 / 24 | 24 / 32 / 12 | 12 / 20 / 8 |
| 震動幅度 | ×1.0 | ×0.6 | ×0.4 |
| 頓幀 | ×1.0 | ×0.5 | 0 |
| 光暈 sprite | 開 | 開 | 關（純圓） |

判定：init 時 `min(VW,VH) < 700 || devicePixelRatio > 2` → tier2；`fx.setTier(3)` 可強制。每幀預算：粒子 ≤1.2ms、總特效 ≤2ms。量測：demo 右下角即時顯示粒子／環／字數，`fx.stats()` 回傳同樣數據。

## 6. S1 施工順序（建議工單）

1. 建 `js/fx.js`：把 demo 的 IIFE 原樣搬入（只補註解），驗收＝demo 五個 preset 在遊戲內等價。（0.5 天）
2. 接線：Lead 先切 B（`main.js`／`sea.js`）與 C（`index.html`）的跨檔工單；D 改 `base.js`／`space.js` 三處 transform。（0.5 天）
3. 海面：命中／擊殺／受傷／拾取／建造改用 `fx.*`，移除舊 `burst`／`float` 呼叫（`sea.js` 屬 B，D 出 patch）。（1 天）
4. 砲塔：後座力＋命中火花＋`core` 音效（`base.js:183-210`）。（0.5 天）
5. 太空：升空受擊、機庫撞擊、月球外星人／Boss 受擊、光束終結（`space.js` 全屬 D）。（1 天）
6. 驗收：1280×800 與 390×844 各跑一次「連續擊殺 30 隻」不掉幀；截圖比對 `_shots\D\`。（0.5 天）

## 7. 風險與限制

- 跨檔接線需 B、C 配合，Lead 必須先切工單，否則 `fx` 只能掛在 demo 裡。
- 頓幀會帶來 90–160ms 輸入延遲；只用於命中／受擊，移動與射擊不凍結。
- additive 粒子在低階 GPU 可能過曝，tier2/3 已把 `a0` 降 15%、光暈改純圓。
- 純表現層改動，**不新增存檔欄位**，v0.3.0 存檔可直接沿用。

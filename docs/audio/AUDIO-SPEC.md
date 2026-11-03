# 背景音樂規格（v0.5 / 候選）

> 產出：C · 2026-11-04 · 本機 ComfyUI + ACE-Step 1.5（`ace_step_1.5_turbo_aio.safetensors`）
> 檔案：`docs/audio/*.mp3`（6 段＝3 場景 × 2 候選，每段 477–489KB、≤1.5MB）
> ⚠️ **這是給耳朵驗收的候選，不是最終定稿**：我只有波形／響度數據，無法判斷旋律好不好聽。請 Lead／使用者試聽後各場景選 a 或 b。

## 1. 檔案與量測（48kHz stereo MP3 128kbps）

| 檔案 | 場景 | 候選 | BPM / 調性 | seed | 長度 | LUFS | peak | RMS | 靜音比例 | 循環交叉 | 建議 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `sea-a.mp3` | 海面 ambient | A | 64 / A minor | 61001 | 30.50s | -18.0 | 0.908 | 0.107 | 4.5% | 1.5s | **主選**（最連續、海流感） |
| `sea-b.mp3` | 海面 ambient | B | 60 / A minor | 61002 | 30.50s | -17.9 | 0.737 | 0.080 | 16.7% | 1.5s | 備選（更稀疏、鋼琴感） |
| `launch-a.mp3` | 升空 tense | A | 108 / D minor | 62001 | 31.00s | -18.0 | 0.710 | 0.107 | 36.7% | 1.0s | 備選（動態大、有留白） |
| `launch-b.mp3` | 升空 tense | B | 116 / D minor | 62002 | 31.00s | -17.9 | 0.798 | 0.114 | 19.3% | 1.0s | **主選**（較連續，適合倒數計時） |
| `boss-a.mp3` | 母船 boss | A | 136 / E minor | 63001 | 31.25s | -18.0 | 0.614 | 0.118 | 11.4% | 0.75s | **主選**（低頻較厚） |
| `boss-b.mp3` | 母船 boss | B | 132 / E minor | 63002 | 31.25s | -18.1 | 0.539 | 0.070 | 8.2% | 0.75s | 備選（較輕、動態壓縮少） |

- 峰值全部 < 0.95、無 clipping；6 段 LUFS 對齊在 **-18.0 ±0.1 LU**（各段音量一致，切場景不會忽大忽小）。
- 原生成 32s 版本在 `_shots/C4/audio-raw/`（保留可重製）。

## 2. 生成方式（可重現）

```powershell
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\_dev\comfy'
node music.mjs --tags "instrumental, dark ambient, underwater, slow synth pad, cinematic, calm, deep sub bass, no drums" `
  --bpm 64 --seconds 32 --keyscale "A minor" --seed 61001 --name sea-a --out "<raw>"
# 其餘 5 段同工具，參數照 §1 的 BPM／調性／seed；tags 依場景換：
#   sea-b：instrumental, ambient, deep ocean, soft piano, warm pad, calm, loopable, no drums
#   launch-a：instrumental, tense, cinematic, rising strings, taiko drums, pulse, launch, epic
#   launch-b：instrumental, electronic, tense pulse, arpeggio, driving percussion, cinematic, rising
#   boss-a：instrumental, dark industrial, boss fight, heavy percussion, distorted bass, alien, aggressive
#   boss-b：instrumental, electronic, boss battle, pounding drums, brass stabs, ominous, fast
```

後製（Python + numpy／ffmpeg）：
1. 解碼 48kHz stereo → 正規化 RMS 0.12 + 軟限幅（threshold 0.80、ceiling 0.97）。
2. 無縫循環：把尾巴 f 秒與開頭 f 秒交叉淡入（sea 1.5s／launch 1.0s／boss 0.75s），長度 = 32−f。
3. 依量測把每段 LUFS 對齊 -18（增益 +0.7～−2.0dB），再輸出 128kbps MP3。

## 3. 接線（給 B 的 WebAudio）

**不要用 `<audio loop>`**：MP3 有編碼 padding，Chrome 實測會在 loop 邊界留 50–100ms 空隙。用 WebAudio：

```js
// 建議模組：js/music.js（或塞進 main.js；API 可自行調整）
const MUSIC = {
  ctx: null, buffers: new Map(), src: null, gain: null, muted: false,
  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0.32;          // 音樂總音量（≈ -10dB）
    this.gain.connect(this.ctx.destination);
  },
  async load(name) {                       // 'sea-a' | 'launch-b' | 'boss-a'…
    if (this.buffers.has(name)) return this.buffers.get(name);
    const r = await fetch(`docs/audio/${name}.mp3?v=0.5.0`);
    const buf = await this.ctx.decodeAudioData(await r.arrayBuffer());
    this.buffers.set(name, buf); return buf;
  },
  async play(name, { fade = 1.2, sceneGain = 1 } = {}) {
    if (!this.ctx) await this.init();
    const buf = await this.load(name);
    this.stop(fade);
    const src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    src.loopStart = 0; src.loopEnd = buf.duration;   // 檔案本身已是無縫 loop
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.32 * sceneGain, this.ctx.currentTime + fade);
    src.connect(g).connect(this.ctx.destination);
    src.start(0); this.src = src; this.gain = g;
  },
  stop(fade = 0.8) {
    if (!this.src) return;
    const s = this.src, g = this.gain, t = this.ctx.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(0, t + fade);
    try { s.stop(t + fade + 0.05); } catch (e) {}
    this.src = null;
  },
  setMuted(m) { this.muted = m; if (this.gain) this.gain.gain.value = m ? 0 : 0.32; },
  duck(db = -6, ms = 350) { /* 大爆炸／光束時暫降，之後 ramp 回 */ }
};
```

- 場景映射：`title/intro → sea-a`（淡入 1.5s）、`sea → sea-a`（或 `sea-b`）、`launch → launch-b`、`moon → boss-a`、`ending → sea-b`。
- 場景音量：sea 1.0、launch 1.0、moon 1.15（boss 可 +1.2dB）；切場景 `stop(0.8)`→`play(..., {fade:1.2})`。
- 與 `M` 靜音整合：現有 `muted` 同時控制 `sfx()`；音樂用 `MUSIC.setMuted(muted)`。
- 預載：3 個主選共 ~1.45MB；`AudioContext` 要在第一次使用者手勢（點「開始遊戲」）後 `resume()`，避免自動播放政策擋下。
- 若 S1b 要換候選：只改檔名（`sea-b` 等），API 不動。

## 4. 授權／素材註記

- 全部由**本機 ComfyUI + ACE-Step 1.5** 生成：無第三方取樣、無外部音檔、無歌詞（instrumental）。
- ACE-Step 模型為 Apache-2.0（實際條款以模型卡為準）；生成音檔視為自有素材，可隨遊戲散布。
- 上架前請在 `docs/marketing/LEGAL.md` 再確認模型授權與平台政策；本文件不是法律意見。
- 重製紀錄：seed／BPM／調性／tags 已列 §1–§2，同模型版本可重新生成。

## 5. 驗收清單（給試聽的人）

1. 循環 3 次以上，邊界沒有「喀」或明顯斷點（檔案已做 0.0000 seam，但耳聽為準）。
2. 沒有人聲、沒有歌詞、沒有突然的爆音（peak < 0.95）。
3. 音量與其他場景一致（±0.3 LUFS 已對齊；若覺得 boss 太小，調 `sceneGain` 而不是改檔）。
4. `launch-a` 靜音比例 36.7%，若聽起來太空，換 `launch-b`（19.3%）。

## 6. 備援：若 6 段候選都不採用

給 B 的 WebAudio 程序化配樂（不用音檔、0 版權風險）：
- 海面：A minor 4 和弦（Am–F–C–G）pad，64bpm，8 小節 loop，低通 800Hz + 慢 LFO。
- 升空：D minor 脈衝（D–Bb–F–C），108bpm，16 分音符 arpeggio + 每 2 拍 kick。
- 母船：E minor 工業風，136bpm，distorted saw bass（E–G–Bb）+ 4/4 重拍 + 隨機金屬 noise hit。
- 全部走現有 `tone()/noiseHit()` 的 AudioContext；場景切換 1s 交叉淡入；音量與 §3 相同（-18 LUFS 對應 gain 0.32）。

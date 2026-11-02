# 冰島倒數儀表板 🧊

冰島冬季環島（2027/3/1–3/15）的倒數計時網頁：Three.js 3D 冰島與極光、Soft-3D 儀表板、每天一句幹話。

**網址（部署後）**：https://justin4512.github.io/iceland-countdown/

## 功能

- **主倒數**：倒數到 2027/2/28 23:00（台北）桃園起飛；最後 7 天 3D 場景切成「起飛模式」（地球＋TPE→KEF 航線）
  - 3/1–3/15 顯示「旅程進行中 Day X / 15」與當天行程
  - 3/16 之後切成「回憶模式：已回國 N 天」
- **每日幹話**：2026/11/2–2027/3/31 每天一句（台北時間 00:00 換），之後循環；可往回翻、看歷史、分享
- **行前清單**：68 項，含建議完成時間（T-天數），逾期亮紅；打勾只存在本機瀏覽器
- **冰島即時面板**：雷克雅維克時間、天氣、風速、日照、ISK→TWD 匯率、Kp 極光指數（抓不到時顯示快取或平均值）
- **15 天航線圖**：每日里程長條、滑過時 3D 島上對應景點會亮起
- 深淺色跟著系統；手機、低效能裝置、開啟「減少動態效果」時預設關閉 3D（右上角可手動開關）；音效預設靜音

## 開發

```bash
npm install
npm run dev
```

開啟 http://localhost:5173/iceland-countdown/

預覽不同階段：網址加 `?now=`，例如
- `?now=2027-02-24T12:00:00%2B08:00`（起飛模式）
- `?now=2027-03-04T10:00:00Z`（旅程 Day 4）
- `?now=2027-03-20T10:00:00Z`（回憶模式）

> ⚠️ 隨身碟（FAT32）不支援 npm 需要的符號連結，`npm install` 會極慢甚至失敗。
> 要在本機跑的話，請把專案複製到內建硬碟再安裝；GitHub Actions 部署不受影響。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個空的 **public** repo，名稱 `iceland-countdown`（不要勾 README）
2. 在專案資料夾執行：
   ```bash
   git add -A
   git commit -m "feat: 冰島倒數儀表板"
   git remote add origin https://github.com/justin4512/iceland-countdown.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**
4. 等 Actions 跑完（約 1–2 分鐘），打開上面的網址

之後每次 push 到 `main` 都會自動重新部署。

## 修改內容

| 要改什麼 | 檔案 |
|---|---|
| 每日幹話 | `src/data/quotes.ts`（審稿版：`content-draft.md`） |
| 行前清單 | `src/data/checklist.ts` |
| 景點、照片說明 | `src/data/spots.ts`、`public/photos/` |
| 行程與里程 | `src/data/itinerary.ts` |
| 互動地圖連結 | `src/data/itinerary.ts` 的 `MAP_SITE_URL`（填了才會出現按鈕） |

## 資料與授權

- 景點照片：Wikimedia Commons，各作者依 CC0 / CC BY / CC BY-SA 授權，詳見 [CREDITS.md](CREDITS.md)
- 天氣：[Open-Meteo](https://open-meteo.com/)（CC BY 4.0）
- 匯率：[ExchangeRate-API](https://www.exchangerate-api.com/)
- Kp 指數：[NOAA SWPC](https://www.swpc.noaa.gov/)

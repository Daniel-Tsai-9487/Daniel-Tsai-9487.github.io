# 個人網站架設

這是一個以 React、Vite 與原創系統地圖介面製作的個人作品集。它以高對比、章節化、滾動揭露的視覺節奏呈現作品，但沒有使用《絕區零》或其他參考網站的角色、商標、圖片與原始設計資產。

## 內容架構

- `src/data/portfolio.ts`：34 個可公開列示的專案、研究、原型、企畫、課程實作與原創寫作企畫，以及各自的公開邊界。
- `src/data/caseStudies.ts`：6 件旗艦案例的問題框架、本人貢獻、系統流程、案例敘事、里程碑、成果，以及可管理的 `media`、`evidence`、`links` 與 `publicScope`。
- `src/App.tsx`：即時專案狀態地圖、代表成果、可篩選的完整檔案庫、34 個可分享的專案詳情頁、經歷、能力與合作入口。
- `src/styles.css`：進場、捲動揭露、章節字幕、專案頁轉場與 reduced-motion 支援。

## 專案詳情網址

每張作品卡、系統地圖項目與代表成果按鈕都會開啟全頁專案檔案，網址格式為：

```text
https://daniel-tsai-9487.github.io/projects/<project-id>/
```

本機開發時，將網域替換為 Vite 顯示的本機網址。舊的 `#project/<project-id>` 連結仍可開啟，並會自動改寫為新路徑。詳情頁提供返回作品庫及依作品序號排列的上一件／下一件導覽。

## 旗艦案例

以下 6 件作品會在標準專案摘要後顯示深度案例層：

- VAP 早期預警研究
- 嚥域
- BioPulse-SoC
- YieldSentry
- ERP AI 智慧報價系統
- TradePilot

旗艦頁以程式原生的系統流程、公開媒體導覽、證據索引與文字案例呈現。沒有公開素材的媒體項目會顯示原生資料視覺，並明確標示不是專案截圖；不嵌入院內資料、醫療圖表、客戶文件、原始金融資料、合作方資料或未獲授權的本機媒體。其餘作品維持標準檔案頁，避免將不同成熟度的工作套用同一種展示深度。

## 案例公開資料模型

- `media`：可切換的公開媒體敘事，可選填真實公開素材的 `src` 與 `alt`；未填時以程式原生視覺呈現，不冒充截圖。
- `evidence`：每案可公開的成果、角色或工程紀錄摘要。
- `links`：公開資源與明確標示的受限資源；只有提供 `href` 的項目才會變成可點擊外連。
- `publicScope`：案例摘要與不公開、不可宣稱的範圍，避免公開層和原始資料邊界混淆。

公開個人頁面已放入合作入口：GitHub [Daniel-Tsai-9487](https://github.com/Daniel-Tsai-9487)、Facebook [daniel.tsai.628090](https://www.facebook.com/daniel.tsai.628090/)、Instagram [daniel_tsai_0.0](https://www.instagram.com/daniel_tsai_0.0/)。

## screenshot-to-code 狀態

`tools/screenshot-to-code` 已下載在本機，`inputs/zenless-reference.png` 僅作為視覺參考輸入。本網站本體不是由 screenshot-to-code 生成，而是手寫 React/CSS。

目前 screenshot-to-code 尚未具備可執行條件：沒有模型 API 金鑰、`.env`、後端虛擬環境、前端依賴或 7001 後端服務。由 `pnpm dev` 啟動的本機 Vite 開發伺服器與 screenshot-to-code 無關。

## 動態與工具選擇

- `Motion`：已作為網站的 React 動畫層，用於頁面切換、代表成果切換、作品篩選重排與滾動字幕；以 `LazyMotion`、`domMax` 與系統的 reduced-motion 設定控制動畫行為。
- `Anime.js`：暫不與 Motion 並用；日後若需要單一高編排效果，例如 SVG 線路繪製或文字 scramble，再獨立導入，避免同一元素被兩套動畫庫同時控制。
- `Manus`：僅可作公開資訊的視覺方向、文案與原型草稿輔助，不作為原始碼或部署來源；不得上傳研究、醫療、合作或未公開競賽資料。
- `Bklit UI`：目前不導入。此專案沒有 shadcn/Tailwind 設計系統，也沒有可公開、可追溯的量化資料；未來建立公開的 Evidence Lab 後，再評估以圖表呈現資料。

## 本機啟動

```powershell
pnpm install
pnpm dev
```

## 發布前調整

- 在 `src/data/portfolio.ts` 更新最新經歷、專案狀態與公開邊界。
- 依個人公開意願調整 `src/App.tsx` 合作入口的 GitHub 與社群連結，並只新增已授權公開的聯絡方式。
- 只保留可公開的研究、競賽與合作資訊。
- `tools/screenshot-to-code/inputs/zenless-reference.png` 是本地版 screenshot-to-code 的參考輸入，不會被網站載入或發布。

## 公開部署與自訂網域

網站會在建置時為 34 件專案產生獨立靜態頁面、頁級標題、描述、canonical、Open Graph 與 JSON-LD，並輸出 `sitemap.xml`。正式公開網址先使用 `https://daniel-tsai-9487.github.io/`；等取得有效 FQDN 後，只需更新 `src/site.ts` 的 `origin` 與新增 `public/CNAME`。

# 課聚｜論文或技術報告撰寫

GitHub Pages 前端 + Supabase Auth、Postgres、Storage 與 Edge Function 後端。

- 網站：https://daphnelo.github.io/mastercalss/
- 原網站（遷移完成前使用）：https://seminar-course-hub-1012.daneshan.chatgpt.site/
- 18 位同學、每堂至少四人排班、逐堂點名、可調加扣分、報告日期與主題、每人五份 20 MB 附件。

## 目前狀態

前端可自動發布。尚未提供 Supabase 專案設定時會顯示準備中畫面，不會假裝已保存資料。
原網站的資料不會自動複製到 Supabase；切換前必須匯入班表，若原站已有點名、報告或附件，請先另外完成資料遷移並核對。
公開儲存庫只有範例名單；真實姓名、學號、登入資料及報告附件不可提交到 Git。

## 首次設定

1. 在 Supabase 建立專案。到 SQL Editor 執行 `supabase/migrations/202610120001_course.sql`，建立課程資料表與私人 `reports` 儲存桶。
2. 在 Authentication → URL Configuration 設定 Site URL 及 Redirect URL 為 `https://daphnelo.github.io/mastercalss/`。停用公開註冊；由老師建立或邀請帳號。
3. 設定 Edge Function 的 `TEACHER_EMAIL` 為指定老師 Email，`ALLOWED_ORIGIN` 為 `https://daphnelo.github.io`。不要把私密金鑰放進前端或 GitHub Variables。
4. 使用 Supabase CLI 連接專案後部署：

   ```sh
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase functions deploy course-api --no-verify-jwt
   ```

   Function 會用 `auth.getUser(token)` 向 Supabase 驗證每一筆使用者請求；`verify_jwt=false` 僅關閉舊版閘道驗證，不會繞過程式內的登入驗證。`SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY` 使用 Supabase Function 的伺服器環境變數。

5. 在 GitHub 儲存庫 Settings → Secrets and variables → Actions → Variables 加入：
   - `VITE_SUPABASE_URL`：Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`：Publishable key 或舊版 anon key，**不能使用 service_role key**
6. Settings → Pages 的 Source 選 GitHub Actions；Actions → Publish course website → Run workflow。
7. 在 Supabase Authentication 建立老師帳號，由老師自行設定密碼。登入網站後啟用課程，到「課程設定」匯入私人班表 JSON，再填寫學年與學生 Email。
8. 建立／邀請學生 Auth 帳號，Email 必須與課程名單一致。學生可透過「首次使用 / 忘記密碼」設定自己的密碼。

## 權限與資料

公開網址只提供頁面程式。資料表啟用 RLS，且撤銷 anon/authenticated 直接存取；附件儲存桶為私人。
所有資料與檔案經由 Edge Function；老師可管理全部，學生只能修改自己的報告、報名及附件，僅看自己的出席資料。
只有 `TEACHER_EMAIL` 指定的已驗證帳號可首次啟用課程，避免公開網址被搶先取得老師權限。
資料更新採 revision 比對，避免多人操作覆蓋；上傳失敗會清理未引用的檔案。

## 本機開發

```sh
npm ci
# 將 .env.example 複製為 .env.local，填入公開設定
npm run dev
npm run build
```

本機測試後端時，需將該測試專案的 `ALLOWED_ORIGIN` 設成前端本機 origin；勿對正式課程放寬為任意來源。

## 驗收

接上真實 Supabase 後，依序驗證：老師啟用與匯入、學生登入、日期點名、分數調整、報告儲存、附件上傳下載與學生間存取阻擋。未接上後端前，無法完成雲端整合驗收。

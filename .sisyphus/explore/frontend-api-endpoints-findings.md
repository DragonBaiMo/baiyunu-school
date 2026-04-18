# 前端 API 端点探索结果

## 一、alumni-h5（学生端）API 调用清单

### api.ts 实现

文件：`i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\lib\api.ts`

- BASE_URL 取自 `VITE_API_BASE`，默认 `http://localhost:3000`
- 自动附加 `Authorization: Bearer <token>` 头
- 暴露方法：`api.get<T>(path)` / `api.post<T>(path, body)` / `api.put<T>(path, body)` / `api.delete<T>(path)`
- 无 401 自动跳转（与 admin-web 不同）

### API 调用列表

| # | HTTP 方法 | URL 路径 | 所在文件:行号 | 请求体结构 | 预期响应类型 | 用途 |
|---|-----------|----------|---------------|------------|-------------|------|
| 1 | GET | `/api/v1/public/portal/news?limit=5` | `apps/alumni-h5/src/pages/HomePage.tsx:63` | — | `NewsItem[]` (`{id,title,summary,publishedAt,coverUrl?}`) | 首页新闻动态列表 |
| 2 | GET | `/api/v1/public/activities?limit=20` | `apps/alumni-h5/src/pages/ActivityPage.tsx:49` | — | `Activity[]` (`{id,title,coverUrl?,startTime,endTime,location,enrolled,capacity,status}`) | 活动列表 |
| 3 | GET | `/api/v1/public/activities/${id}` | `apps/alumni-h5/src/pages/ActivityDetailPage.tsx:51` | — | `ActivityDetail` (`{id,title,coverUrl?,startTime,endTime,location,enrolled,capacity,status,organizer?,descriptionHtml?,myEnrollment?}`) | 活动详情 |
| 4 | GET | `/api/v1/public/donation/wall/stats` | `apps/alumni-h5/src/pages/DonationPage.tsx:41` | — | `DonationStats` (`{totalAmount,totalCount}`) | 捐赠墙统计 |
| 5 | GET | `/api/v1/alumni/workflow/reservations` | `apps/alumni-h5/src/pages/BookingPage.tsx:57` | — | `Reservation[]` | 我的预约列表（需登录） |
| 6 | POST | `/api/v1/alumni/auth/apply` | `apps/alumni-h5/src/pages/LoginPage.tsx:198` | `{name,graduationYear,major,phone,...form}` | void（无 res 使用） | 校友认证申请 |
| 7 | POST | `/api/v1/alumni/activities/${id}/enroll` | `apps/alumni-h5/src/pages/EnrollPage.tsx:38` | `{name,phone,customFields:{shirtSize,dietNote}}` | `EnrollResult` (`{ticketNo,...}`) | 活动报名 |
| 8 | POST | `/api/v1/alumni/workflow/reservations` | `apps/alumni-h5/src/pages/BookingPage.tsx:93` | `{date,timeslot,companions,reason,plate?}` | `BookingResult` | 返校预约提交 |
| 9 | POST | `/api/v1/alumni/donation/orders` | `apps/alumni-h5/src/pages/DonationDetailPage.tsx:59` | `{projectId,amount,message?,anonymous}` | `DonationResult` | 捐赠下单 |

### URL 路径前缀分组

- `/api/v1/public/*` — 公开接口（无需登录）：4 个
- `/api/v1/alumni/*` — 校友接口（需登录态 Bearer Token）：5 个

---

## 二、admin-web（管理端）API 调用清单

文件：`i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\lib\api.ts`

- BASE_URL 取自 `VITE_API_BASE`，默认 `http://localhost:3000`
- 自动附加 `Authorization: Bearer <token>` 头
- **401 时自动清除 token 并跳转 `/login`**
- 暴露方法：`api.get<T>(path)` / `api.post<T>(path, body)` / `api.put<T>(path, body)` / `api.delete<T>(path)`

### API 调用列表

**当前 admin-web 所有页面均无实际 api 调用**。虽然 `api.ts` 已定义完整，但所有页面（dashboard / approval-list / approval-detail / activity-list / activity-editor / news-list / news-editor / donation-list / org-tree / settings / login）中均未 import 或使用 `api` 对象。

---

## 三、auth.ts 实现对比

### alumni-h5 auth.ts

文件：`i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\lib\auth.ts`

- 存储 key：`bynu_token` / `bynu_user`
- `AuthUser` 接口：`{sub:string, roles:string[], name?:string}`
- 函数：`getToken()` / `setToken(token)` / `clearAuth()` / `getUser()` / `setUser(user)` / `isAuthenticated()`
- `isAuthenticated()` = `getToken() !== null`

### admin-web auth.ts

文件：`i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\lib\auth.ts`

- 存储 key：`bynu.admin.token`
- 函数：`getToken()` / `setToken(value | null)` / `isAuthenticated()`
- `isAuthenticated()` = `typeof getToken() === 'string' && getToken()!.length > 0`
- 无 User 对象管理
- 注释标注 Phase 1b 将迁移到 httpOnly Cookie

---

## 四、需要登录态的页面

### alumni-h5

守卫组件：`RequireAuth`（`apps/alumni-h5/src/components/RequireAuth.tsx`）— 包装为 `<Outlet />`，未登录跳 `/login`。

由 `App.tsx:34` 的 `<Route element={<RequireAuth />}>` 保护以下页面：

| 路由 | 页面组件 | 用途 |
|------|---------|------|
| `/card` | CardPage | 校友卡 |
| `/activity/:id` | ActivityDetailPage | 活动详情 |
| `/activity/:id/enroll` | EnrollPage | 活动报名 |
| `/donation` | DonationPage | 捐赠列表 |
| `/donation/:id` | DonationDetailPage | 捐赠详情/下单 |
| `/booking` | BookingPage | 返校预约 |

另外，以下页面虽不在 RequireAuth 下，但内部使用 `isAuthenticated()` 做条件渲染：
- `/home`（HomePage.tsx:54）
- `/mine`（MinePage.tsx:34）
- Layout 组件（Layout.tsx:15）

### admin-web

守卫组件：`RequireAuth`（定义在 `apps/admin-web/src/router.tsx:18`）— 包装 `<AdminLayout />`，未登录跳 `/login`。

由 `router.tsx:31` 的 `<RequireAuth>` 保护以下页面：

| 路由 | 页面组件 | 用途 |
|------|---------|------|
| `/dashboard` | DashboardPage | 仪表盘 |
| `/approval` | ApprovalListPage | 审批列表 |
| `/approval/:id` | ApprovalDetailPage | 审批详情 |
| `/activities` | ActivityListPage | 活动管理列表 |
| `/activities/new` | ActivityEditorPage | 新建活动 |
| `/activities/:id/edit` | ActivityEditorPage | 编辑活动 |
| `/portal/news` | NewsListPage | 新闻管理列表 |
| `/portal/news/new` | NewsEditorPage | 新建新闻 |
| `/portal/news/:id/edit` | NewsEditorPage | 编辑新闻 |
| `/donation` | DonationListPage | 捐赠管理 |
| `/org` | OrgTreePage | 组织架构 |
| `/settings` | SettingsPage | 系统设置 |

不需要登录的页面：`/login`（LoginPage）、`*`（NotFoundPage）

---

<results>
<files>
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\lib\api.ts:1 — alumni-h5 API 客户端实现（get/post/put/delete，Bearer token 自动注入）
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\lib\api.ts:1 — admin-web API 客户端实现（同上，额外 401 自动跳转 /login）
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\lib\auth.ts:1 — alumni-h5 认证状态管理（token + user localStorage）
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\lib\auth.ts:1 — admin-web 认证状态管理（仅 token）
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\HomePage.tsx:63 — GET /api/v1/public/portal/news
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\ActivityPage.tsx:49 — GET /api/v1/public/activities
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\ActivityDetailPage.tsx:51 — GET /api/v1/public/activities/:id
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\DonationPage.tsx:41 — GET /api/v1/public/donation/wall/stats
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\BookingPage.tsx:57 — GET /api/v1/alumni/workflow/reservations
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\LoginPage.tsx:198 — POST /api/v1/alumni/auth/apply
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\EnrollPage.tsx:38 — POST /api/v1/alumni/activities/:id/enroll
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\BookingPage.tsx:93 — POST /api/v1/alumni/workflow/reservations
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\DonationDetailPage.tsx:59 — POST /api/v1/alumni/donation/orders
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\App.tsx:34 — RequireAuth 路由守卫定义
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\components\RequireAuth.tsx:4 — RequireAuth 组件实现
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\router.tsx:18 — admin-web RequireAuth 守卫定义
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\router.tsx:31 — admin-web 受保护路由入口
</files>

<answer>
alumni-h5 共 9 个 API 调用（4 GET 公开 + 1 GET 需登录 + 4 POST 需登录），admin-web 当前 0 个实际 API 调用（api.ts 已就绪但页面尚未接入）。alumni-h5 有 6 个路由受 RequireAuth 保护，admin-web 有 12 个路由受保护。两端 auth 实现均基于 localStorage token，admin-web 额外有 401 自动清除逻辑。
</answer>

<confidence>
high — 通过 grep 全量扫描 api./fetch/axios 模式，交叉验证 import 语句与实际调用，覆盖两端所有 src 目录。
</confidence>
</results>

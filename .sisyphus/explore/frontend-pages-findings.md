# 前端页面完整源码结构化摘要

---

## 一、admin-web 页面（apps/admin-web/src/pages/）

### 1. login.tsx（~237 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\login.tsx`
- **状态变量**:
  - `form` — `useForm<LoginFormValues>()` 由 react-hook-form + zod 驱动
- **API 调用**: 无（`onSubmit` 仅 `console.log` 占位）
- **表单字段**:
  - `username` (string, min 2, Input)
  - `password` (string, min 6, Input type=password)
- **验证**: zod schema `loginSchema` → zodResolver
- **关键交互**:
  - `form.handleSubmit(onSubmit)` 提交
  - 按钮 hover 改变 gradient → inline style
- **条件渲染**: 左侧品牌面板 `hidden lg:flex` 响应式隐藏

---

### 2. dashboard.tsx（~133 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\dashboard.tsx`
- **状态变量**: 无（纯展示）
- **API 调用**: 无（全部硬编码 `stats`, `pendingApprovals`, `recentActivities`）
- **表单字段**: 无
- **数据展示**:
  - `stats` 4 卡片（校友总数/待审批/今日活动/本月捐赠）
  - `pendingApprovals` 5 行表格（姓名/类型/提交时间/状态）
  - `recentActivities` 5 行列表（标题/日期/报名人数）
- **关键交互**:
  - 快捷操作按钮 Link → `/portal/news/new`, `/activities/new`
  - "查看报表" disabled
- **条件渲染**: 无

---

### 3. approval-list.tsx（~165 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\approval-list.tsx`
- **状态变量**:
  - `typeFilter` (string, 默认 '全部')
  - `statusFilter` (string, 默认 '全部')
  - `query` (string, 搜索关键词)
  - `selected` (Set<string>, 多选工单 ID)
- **API 调用**: 无（硬编码 `MOCK_DATA` 10 条）
- **表单字段**: 无（筛选栏 select + Input 非提交表单）
- **数据展示**:
  - 筛选后表格：checkbox / 工单号 / 申请人 / 类型 / 提交时间 / 状态徽章 / 操作
- **关键交互**:
  - `toggleSelect(id)` — 单行选中切换
  - `toggleAll()` — 全选/取消全选
  - 操作列：查看（Link → `/approval/{id}`）、通过、拒绝 ghost 按钮
  - 底部：批量通过 / 批量拒绝（`selected.size > 0` 时显示）
- **条件渲染**: `selected.size > 0` 显示批量操作

---

### 4. approval-detail.tsx（~158 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\approval-detail.tsx`
- **状态变量**:
  - `opinion` (string, 审核意见)
  - `showReject` (boolean, 拒绝原因面板)
  - `rejectReason` (string, 选中的拒绝原因)
- **URL 参数**: `useParams<{ id: string }>()`
- **API 调用**: 无（硬编码 `MOCK_DETAIL` + `MOCK_HISTORY`）
- **表单字段**:
  - `opinion` (textarea, 审核意见)
  - `rejectReason` (radio group: 信息不完整/证件照片模糊/姓名与证件不匹配/非本校校友/其他)
- **数据展示**:
  - 左侧：申请人 dl 网格（姓名/身份证号/毕业年份/学院/专业/学号/联系电话/邮箱）
  - 附件材料占位（身份证正反面）
  - 右侧：审核操作面板 + 审核历史时间线
- **关键交互**:
  - 通过按钮（绿色）
  - 拒绝按钮 → toggle `showReject` → 展开拒绝原因 radio
- **条件渲染**: `showReject` 控制拒绝原因面板

---

### 5. activity-list.tsx（~95 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\activity-list.tsx`
- **状态变量**: 无（纯展示）
- **API 调用**: 无（硬编码 `MOCK_DATA` 5 条）
- **表单字段**: 无
- **数据展示**:
  - 表格：活动名称/时间/地点/报名÷上限/状态徽章/操作
  - 状态：草稿/报名中/已结束/已取消
- **关键交互**:
  - 新建活动 Link → `/activities/new`
  - 操作列：编辑 Link → `/activities/{id}/edit`、发布/取消/上下线/报名人 ghost 按钮
- **条件渲染**: 无

---

### 6. activity-editor.tsx（~173 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\activity-editor.tsx`
- **状态变量**:
  - `title` (string)
  - `actType` (string, 默认 '校庆')
  - `startTime` (string, datetime-local)
  - `endTime` (string, datetime-local)
  - `location` (string)
  - `capacity` (string, number 输入)
  - `description` (string, textarea)
  - `fields` (CustomField[], 自定义报名字段数组)
- **URL 参数**: `useParams<{ id: string }>()` → `isEdit`
- **API 调用**: 无（保存/发布按钮无 handler）
- **表单字段**: title / actType(select: 校庆/讲座/社交/文体/其他) / startTime / endTime / location / capacity / description / 自定义字段（name, type, required）
- **关键交互**:
  - `addField()` — 添加自定义字段
  - `removeField(fieldId)` — 删除字段
  - `updateField(fieldId, patch)` — 更新字段属性
  - 底部：保存草稿 / 发布（无 handler）
- **条件渲染**: `isEdit` 控制标题文案

---

### 7. news-list.tsx（~84 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\news-list.tsx`
- **状态变量**: 无
- **API 调用**: 无（硬编码 5 条）
- **数据展示**: 表格：标题/作者/发布时间/状态(草稿/已发布)/操作
- **关键交互**:
  - 发布新闻 Link → `/portal/news/new`
  - 编辑 Link → `/portal/news/{id}/edit`
  - 草稿可发布（Upload 按钮）
  - 删除按钮（Trash2）
- **条件渲染**: `row.status === '草稿'` 时显示发布按钮

---

### 8. news-editor.tsx（~105 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\news-editor.tsx`
- **状态变量**:
  - `title` (string)
  - `summary` (string, textarea)
  - `content` (string, textarea)
  - `category` (string, 默认 '校园新闻')
- **URL 参数**: `useParams<{ id: string }>()` → `isEdit`
- **API 调用**: 无
- **表单字段**: title / summary / category(select: 校园新闻/校友风采/通知公告/活动报道/其他) / 封面图上传占位 / content(textarea)
- **关键交互**: 保存草稿 / 发布（无 handler）
- **条件渲染**: `isEdit` 控制标题

---

### 9. donation-list.tsx（~122 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\donation-list.tsx`
- **状态变量**: 无
- **API 调用**: 无（硬编码 10 条 + 4 统计卡片）
- **数据展示**:
  - 统计卡片：累计金额/捐赠人次/今日新增/待处理退款
  - 表格：订单号/捐赠人/金额/项目/时间/状态(已完成/待确认/已退款)
- **关键交互**: 已完成状态行显示退款按钮
- **条件渲染**: `row.status === '已完成'` 时显示退款按钮

---

### 10. org-tree.tsx（~173 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\org-tree.tsx`
- **状态变量**:
  - `selectedId` (string, 默认 'root')
  - `expanded` (boolean, TreeNode 内部)
- **API 调用**: 无（硬编码树形数据 `ORG_TREE`）
- **数据展示**:
  - 左侧：递归树形组件 `TreeNode`（白云学院校友总会 → 5 个分会 → 子系）
  - 右侧：选中节点详情（描述/创建时间） + 下级节点表格
- **关键交互**:
  - 点击树节点 → `onSelect(id)` + toggle expand
  - 新增子节点 / 编辑 / 删除按钮（无 handler）
  - 下级节点行点击 → `setSelectedId(child.id)`
- **条件渲染**: `hasChildren` 控制展开箭头 / `selected.children` 控制下级表格

---

### 11. settings.tsx（~17 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\settings.tsx`
- **状态变量**: 无
- **API 调用**: 无
- **内容**: 纯占位卡片，文本"系统设置页面占位"

---

### 12. not-found.tsx（~16 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\not-found.tsx`
- **状态变量**: 无
- **API 调用**: 无
- **内容**: 404 页面，Link → `/login`

---

## 二、alumni-h5 页面（apps/alumni-h5/src/pages/）

### 1. CardPage.tsx（~110 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\CardPage.tsx`
- **状态变量**:
  - `qrText` (string, 二维码文本)
  - `cardNo` (string, 初始化时生成 `ALU-{年份}-{5位随机}`)
  - `refreshCount` (number, 刷新计数)
- **API 调用**: 无（`getUser()` 从 `../lib/auth.js` 获取本地用户）
- **数据展示**:
  - 校友卡正面：学校名/姓名/学院·专业/届别·卡号/二维码区域/安全提示
  - 底部：刷新二维码 + 个人信息按钮
- **关键交互**:
  - `refreshQr()` — 刷新二维码文本 + 600ms 延迟
  - `useEffect` — 首次 800ms 加载 + 每 30s 自动刷新
  - 个人信息按钮 → `navigate('/mine')`
- **条件渲染**: 无

---

### 2. ActivityDetailPage.tsx（~152 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\ActivityDetailPage.tsx`
- **状态变量**:
  - `detail` (ActivityDetail | null)
  - `loading` (boolean)
  - `error` (string)
- **URL 参数**: `useParams<{ id: string }>()`
- **API 调用**:
  - **GET** `/api/v1/public/activities/${id}` → `ActivityDetail`
  - 方法: `api.get<ActivityDetail>()`
  - 错误处理: `ApiError` → 状态码 / 通用 "网络异常"
- **数据展示**:
  - 封面区域
  - 标题 + 状态徽章 (open/full/closed/cancelled)
  - 信息卡片：时间/地点/报名人数/主办方
  - 活动介绍：dangerouslySetInnerHTML（经 `sanitizeHtml` 过滤 `<script>`）
- **关键交互**:
  - 已报名 → "查看电子票"按钮
  - status=open → Link → `/activity/{id}/enroll`
  - full → "已满员" disabled
  - closed → "已结束" disabled
- **条件渲染**: loading 骨架屏 / error 错误页 / enrolled vs open vs full/closed

---

### 3. EnrollPage.tsx（~157 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\EnrollPage.tsx`
- **状态变量**:
  - `name` (string, 预填 user.name)
  - `phone` (string)
  - `shirtSize` (string)
  - `dietNote` (string)
  - `agreed` (boolean, 免责声明)
  - `submitting` (boolean)
  - `error` (string)
  - `result` (EnrollResult | null, 含 ticketNo)
- **URL 参数**: `useParams<{ id: string }>()`
- **API 调用**:
  - **POST** `/api/v1/alumni/activities/${id}/enroll`
  - 请求体: `{ name, phone, customFields: { shirtSize, dietNote } }`
  - 响应: `EnrollResult { ticketNo: string }`
  - 错误处理: ApiError 状态码 / 通用网络异常
- **表单字段**:
  - `name` (text, required)
  - `phone` (tel, required)
  - `shirtSize` (select: S/M/L/XL/XXL)
  - `dietNote` (textarea)
  - `agreed` (checkbox, 免责声明)
- **关键交互**:
  - `handleSubmit(e)` — 校验 agreed → POST → setResult
  - 成功后展示电子票号 + 二维码占位
  - "返回活动"按钮 → `navigate(/activity/{id})`
- **条件渲染**: `result` 非空 → 成功页面（电子票）; 否则表单

---

### 4. DonationPage.tsx（~144 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\DonationPage.tsx`
- **状态变量**:
  - `stats` (DonationStats | null, {totalAmount, totalCount})
  - `statsLoading` (boolean)
  - `statsError` (string)
- **API 调用**:
  - **GET** `/api/v1/public/donation/wall/stats` → `DonationStats`
  - 错误处理: ApiError / 通用
- **数据展示**:
  - Banner（爱心捐赠）
  - 荣誉墙入口 Link → `/donation/wall`
  - 统计区：捐赠总额 / 捐赠人次
  - 项目列表：3 个硬编码项目（edu-fund/green-campus/digital-lib），进度条
- **关键交互**:
  - 项目 Link → `/donation/{projectId}`
- **条件渲染**: statsLoading 骨架 / statsError 错误 / stats 数据

---

### 5. DonationDetailPage.tsx（~213 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\DonationDetailPage.tsx`
- **状态变量**:
  - `amount` (number, 默认 200)
  - `customAmount` (string)
  - `isCustom` (boolean)
  - `message` (string, 留言)
  - `anonymous` (boolean)
  - `submitting` (boolean)
  - `error` (string)
  - `result` (DonationResult | null, {orderId, certificateNo})
- **URL 参数**: `useParams<{ id: string }>()` → 匹配 `PROJECTS` 字典
- **API 调用**:
  - **POST** `/api/v1/alumni/donation/orders`
  - 请求体: `{ projectId, amount: effectiveAmount, message?, anonymous }`
  - 响应: `DonationResult { orderId, certificateNo }`
  - 错误处理: ApiError / 通用
- **表单字段**:
  - 金额快选按钮 (50/100/200/500/1000) + 自定义
  - `customAmount` (number input, isCustom 时)
  - `message` (textarea, 选填)
  - `anonymous` (checkbox)
- **关键交互**:
  - 快选金额 → `setAmount(a); setIsCustom(false)`
  - "自定义" → `setIsCustom(true)` → 显示 number input
  - `handleSubmit` → POST → 成功后展示捐赠证书
  - 证书页：保存证书 / 分享到微信 → `window.alert` 占位
  - 返回捐赠大厅 → `navigate('/donation')`
- **条件渲染**: project 不存在 → 404 / result 非空 → 证书 / 否则表单

---

### 6. BookingPage.tsx（~318 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\BookingPage.tsx`
- **状态变量**:
  - `expanded` (boolean, 展开预约表单)
  - `date` (string, 日期)
  - `timeslot` ('am' | 'pm')
  - `companionCount` (number, 0-5)
  - `companions` (Companion[], {name, idNumber})
  - `reason` (string, 来访事由)
  - `plate` (string, 车牌号)
  - `submitting` (boolean)
  - `formError` (string)
  - `bookingResult` (BookingResult | null, {reservationNo, date})
  - `reservations` (Reservation[], 我的预约列表)
  - `resLoading` (boolean)
  - `resError` (string)
- **API 调用**:
  - **GET** `/api/v1/alumni/workflow/reservations` → `Reservation[]` (依赖 bookingResult 变化重新获取)
  - **POST** `/api/v1/alumni/workflow/reservations`
  - 请求体: `{ date, timeslot, companions, reason, plate? }`
  - 响应: `BookingResult { reservationNo, date }`
- **表单字段**:
  - `date` (date, required)
  - `timeslot` (radio: 上午/下午)
  - `companionCount` (number, 0-5)
  - 每个 companion: `name` (text, required) + `idNumber` (text, required)
  - `reason` (textarea, required)
  - `plate` (text, 选填)
- **关键交互**:
  - 四宫格办事类型卡片：返校参观 / 档案查询 / 证书补办 / 更多服务
  - 点击"返校参观" → `setExpanded(true)` 展开表单
  - 其他类型 → `window.alert` 占位
  - `handleSubmit` → POST → 成功页（预约编号+等待审批）
  - `companionCount` 变化 → 自动增减 companions 数组
  - 底部"我的预约"列表
- **条件渲染**: bookingResult 非空 → 成功页 / expanded → 表单 / resLoading/resError/空 → 列表状态

---

### 7. AuthVerifyPage.tsx（~131 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\AuthVerifyPage.tsx`
- **状态变量**: 无 React state（读取 localStorage `bynu_auth_application`）
- **API 调用**: 无
- **数据来源**: `localStorage.getItem(STORAGE_KEY)` → `StoredApplication { status, submittedAt }`
- **数据展示**:
  - 三步骤条：提交申请 → 资料审核 → 认证完成
  - 步骤状态：done(绿) / active(蓝) / upcoming(灰)
- **关键交互**:
  - 未提交 → "去认证"按钮 → `navigate('/login')`
  - pending → 进度条动画 + "查看进度"按钮 → `window.alert`
  - approved → "查看校友卡"按钮 → `navigate('/card')`
  - rejected → "重新申请"按钮 → `navigate('/login')`
  - 底部"返回首页" → `navigate('/home')`
- **条件渲染**: 4 种状态分支（无 stored / pending / approved / rejected）

---

### 8. LoginPage.tsx（~466 行）

- **路径**: `i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\LoginPage.tsx`
- **状态变量**（AuthenticationFlow 组件内）:
  - `mode` ('choose' | 'form' | 'submitted')
  - `form` (ApplicationForm: name/idCard/graduationYear/department/major/studentId/phone)
  - `submitting` (boolean)
  - `submitError` (string)
  - `showIdCard` (boolean, 身份证号显隐)
- **数据来源**: `localStorage.getItem('bynu_auth_application')` → `StoredApplication`
- **API 调用**:
  - **POST** `/api/v1/alumni/auth/apply`
  - 请求体: `form` (ApplicationForm 全部字段)
  - 错误处理: catch 后静默（后端未连通也继续走占位逻辑）
  - 提交后写入 localStorage: `{ status: 'pending', submittedAt }`
- **表单字段**:
  - `name` (text, required)
  - `idCard` (password/text, required, min 15 位, maskIdCard 脱敏)
  - `graduationYear` (select, 最近 50 年)
  - `department` (text, required)
  - `major` (text, required)
  - `studentId` (text, 选填)
  - `phone` (tel, required, 11 位, `validatePhone` 正则)
  - 证件照片上传（占位 alert）
- **前端验证**:
  - name 非空
  - idCard >= 15 位
  - department 非空
  - major 非空
  - phone 正则 `/^1[3-9]\d{9}$/`
- **关键交互**:
  - 页面入口：若 localStorage 有 stored → 显示 `ApplicationStatus` 组件
  - 否则进入 `AuthenticationFlow`:
    - mode='choose': 双卡片选择（超星 SSO / 表单自主认证）
    - mode='form': 认证表单 → 提交 → POST + localStorage 写入
    - mode='submitted': 提交成功页 → "查看审核进度" / "返回首页"
  - ApplicationStatus:
    - approved → "查看校友卡" → `/card`
    - rejected → "重新申请" → 清除 localStorage + reload
    - pending → 进度条 + "查看审核进度" → `/auth/verify`
- **条件渲染**: stored 存在 vs 不存在 → 两个主组件分支; mode 三态切换

---

## 三、API 调用汇总表

| 页面 | 方法 | URL | 请求体 | 响应类型 |
|------|------|-----|--------|----------|
| ActivityDetailPage | GET | `/api/v1/public/activities/${id}` | — | `ActivityDetail` |
| EnrollPage | POST | `/api/v1/alumni/activities/${id}/enroll` | `{ name, phone, customFields: { shirtSize, dietNote } }` | `EnrollResult { ticketNo }` |
| DonationPage | GET | `/api/v1/public/donation/wall/stats` | — | `DonationStats { totalAmount, totalCount }` |
| DonationDetailPage | POST | `/api/v1/alumni/donation/orders` | `{ projectId, amount, message?, anonymous }` | `DonationResult { orderId, certificateNo }` |
| BookingPage | GET | `/api/v1/alumni/workflow/reservations` | — | `Reservation[]` |
| BookingPage | POST | `/api/v1/alumni/workflow/reservations` | `{ date, timeslot, companions, reason, plate? }` | `BookingResult { reservationNo, date }` |
| LoginPage | POST | `/api/v1/alumni/auth/apply` | `ApplicationForm { name, idCard, graduationYear, department, major, studentId, phone }` | void（静默 catch） |

admin-web 所有页面当前 **零 API 调用**，全部使用硬编码 Mock 数据。

---

<results>
<files>
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\login.tsx:1-237 — 管理端登录表单，react-hook-form + zod，无 API
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\dashboard.tsx:1-133 — 仪表盘，4 统计卡片 + 待审批表格 + 活动列表，全硬编码
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\approval-list.tsx:1-165 — 审批列表，筛选+多选+批量操作，全硬编码
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\approval-detail.tsx:1-158 — 审批详情，审核操作面板+拒绝原因+历史时间线，全硬编码
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\activity-list.tsx:1-95 — 活动列表，5 条 Mock + 状态徽章
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\activity-editor.tsx:1-173 — 活动编辑器，7 个状态 + 自定义字段 CRUD，无 API
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\news-list.tsx:1-84 — 新闻列表，5 条 Mock
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\news-editor.tsx:1-105 — 新闻编辑器，4 个状态，无 API
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\donation-list.tsx:1-122 — 捐赠列表，统计卡片+10 条 Mock
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\org-tree.tsx:1-173 — 组织架构树，递归 TreeNode + 详情面板
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\settings.tsx:1-17 — 设置占位页
- i:\CustomBuild\Other\baiyunu-school\apps\admin-web\src\pages\not-found.tsx:1-16 — 404 页
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\CardPage.tsx:1-110 — 校友卡，二维码自动刷新（30s），getUser 本地
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\ActivityDetailPage.tsx:1-152 — 活动详情，GET /api/v1/public/activities/{id}，条件渲染 enrolled/open/full
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\EnrollPage.tsx:1-157 — 活动报名，POST /api/v1/alumni/activities/{id}/enroll，成功→电子票
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\DonationPage.tsx:1-144 — 捐赠大厅，GET /api/v1/public/donation/wall/stats + 硬编码项目列表
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\DonationDetailPage.tsx:1-213 — 捐赠详情，POST /api/v1/alumni/donation/orders，快选金额+证书
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\BookingPage.tsx:1-318 — 返校预约，GET+POST /api/v1/alumni/workflow/reservations，随行人动态表单
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\AuthVerifyPage.tsx:1-131 — 审核进度，localStorage 读取，三步骤条
- i:\CustomBuild\Other\baiyunu-school\apps\alumni-h5\src\pages\LoginPage.tsx:1-466 — 校友认证，POST /api/v1/alumni/auth/apply + localStorage 持久化，双入口(SSO/表单)
</files>

<answer>
**admin-web（12 页面）**: 全部零 API 调用，100% 硬编码 Mock 数据。login.tsx 用 react-hook-form + zod 校验但 onSubmit 仅 console.log；dashboard/approval-list/donation-list 等均为静态展示；activity-editor 和 news-editor 有完整表单状态但无提交逻辑。

**alumni-h5（8 页面含 LoginPage）**: 共 7 个真实 API 调用点（2 GET + 5 POST，其中 BookingPage 含 1 GET + 1 POST）。所有 API 调用经过统一的 `api` 封装（`../lib/api.js`），错误处理统一使用 `ApiError` 类型判断。LoginPage 的 POST 为静默 catch（后端未连通也走 localStorage 占位逻辑）。数据持久化通过 localStorage key `bynu_auth_application` 在 LoginPage ↔ AuthVerifyPage 间共享认证状态。

API 路径前缀分两类：`/api/v1/public/*`（公开端点）和 `/api/v1/alumni/*`（需认证端点）。
</answer>

<confidence>
high — 所有 20 个页面文件均已完整读取，API 调用/状态变量/表单字段/条件渲染逻辑已逐行确认。
</confidence>
</results>

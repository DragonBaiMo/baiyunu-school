# Server REST 路由清单

## 基础设施端点（apps/server/src/ 直接定义）

| Method | Path | Controller | 文件 |
|--------|------|------------|------|
| GET | `/internal/health` | HealthController | `apps/server/src/health/health.controller.ts:29` |
| GET | `/metrics` | MetricsController | `apps/server/src/metrics/prom.module.ts:22` |

## 领域模块端点（来自 services/* 包，re-export 到 apps/server/src/modules/）

### Identity（services/identity/src/）

| Method | Path | Controller | 行号 |
|--------|------|------------|------|
| GET | `internal/identity/ping` | IdentityController | identity.module.ts:52 |
| POST | `internal/identity/applications` | IdentityApplicationsController | identity.controller.ts:50 |
| GET | `internal/identity/applications` | IdentityApplicationsController | identity.controller.ts:56 |
| POST | `internal/identity/applications/:id/approve` | IdentityApplicationsController | identity.controller.ts:64 |
| POST | `internal/identity/applications/:id/reject` | IdentityApplicationsController | identity.controller.ts:74 |
| POST | `internal/identity/applications/:id/supplement` | IdentityApplicationsController | identity.controller.ts:87 |
| POST | `internal/identity/cards/:id/rotate-qr` | IdentityCardsController | identity.controller.ts:107 |
| POST | `internal/identity/cards/verify-qr` | IdentityCardsController | identity.controller.ts:116 |

### Portal-CMS（services/portal-cms/src/）

| Method | Path | Controller | 行号 |
|--------|------|------------|------|
| GET | `internal/portal-cms/ping` | PortalCmsInternalController | portal-cms.module.ts:43 |
| GET | `api/v1/public/portal/pages/:slug` | PublicPortalController | portal.controller.ts:57 |
| GET | `api/v1/public/portal/news` | PublicPortalController | portal.controller.ts:62 |
| GET | `api/v1/public/portal/news/:id` | PublicPortalController | portal.controller.ts:68 |
| POST | `api/v1/admin/portal/pages` | AdminPortalController | portal.controller.ts:89 |
| GET | `api/v1/admin/portal/pages` | AdminPortalController | portal.controller.ts:96 |
| GET | `api/v1/admin/portal/pages/:slug` | AdminPortalController | portal.controller.ts:102 |
| PUT | `api/v1/admin/portal/pages/:slug` | AdminPortalController | portal.controller.ts:122 |
| POST | `api/v1/admin/portal/pages/:slug/publish` | AdminPortalController | portal.controller.ts:129 |
| GET | `api/v1/admin/portal/templates` | AdminPortalController | portal.controller.ts:137 |
| POST | `api/v1/admin/portal/templates/apply` | AdminPortalController | portal.controller.ts:143 |
| POST | `api/v1/admin/portal/news` | AdminPortalController | portal.controller.ts:155 |
| GET | `api/v1/admin/portal/news` | AdminPortalController | portal.controller.ts:162 |
| GET | `api/v1/admin/portal/news/:id` | AdminPortalController | portal.controller.ts:169 |
| PUT | `api/v1/admin/portal/news/:id` | AdminPortalController | portal.controller.ts:175 |
| POST | `api/v1/admin/portal/news/:id/publish` | AdminPortalController | portal.controller.ts:182 |
| DELETE | `api/v1/admin/portal/news/:id` | AdminPortalController | portal.controller.ts:188 |

### ETL（services/etl/src/）

| Method | Path | Controller | 行号 |
|--------|------|------------|------|
| GET | `internal/etl/ping` | EtlController | index.ts:15 |

### Notification（services/notification/src/）

| Method | Path | Controller | 行号 |
|--------|------|------------|------|
| GET | `internal/notification/ping` | NotificationController | index.ts:79 |

### Activity（services/activity/src/）

| Method | Path | Controller | 行号 |
|--------|------|------------|------|
| GET | `internal/activity/ping` | ActivityInternalController | activity.module.ts:53 |
| GET | `api/v1/public/activities` | PublicActivityController | activity.controller.ts:63 |
| GET | `api/v1/public/activities/:id` | PublicActivityController | activity.controller.ts:69 |
| POST | `api/v1/alumni/activities/:id/enroll` | AlumniActivityController | activity.controller.ts:85 |
| GET | `api/v1/alumni/activities/enrollments` | AlumniActivityController | activity.controller.ts:104 |
| DELETE | `api/v1/alumni/activities/enrollments/:id` | AlumniActivityController | activity.controller.ts:111 |
| POST | `api/v1/alumni/activities/check-in` | AlumniActivityController | activity.controller.ts:121 |
| POST | `api/v1/admin/activities` | AdminActivityController | activity.controller.ts:148 |
| GET | `api/v1/admin/activities` | AdminActivityController | activity.controller.ts:166 |
| GET | `api/v1/admin/activities/:id` | AdminActivityController | activity.controller.ts:173 |
| PUT | `api/v1/admin/activities/:id` | AdminActivityController | activity.controller.ts:179 |
| POST | `api/v1/admin/activities/:id/publish` | AdminActivityController | activity.controller.ts:189 |
| POST | `api/v1/admin/activities/:id/cancel` | AdminActivityController | activity.controller.ts:195 |
| POST | `api/v1/admin/activities/:id/close` | AdminActivityController | activity.controller.ts:201 |
| GET | `api/v1/admin/activities/:id/enrollments` | AdminActivityController | activity.controller.ts:207 |
| GET | `api/v1/admin/activities/:id/screen` | AdminActivityController | activity.controller.ts:215 |

### Donation（services/donation/src/）

| Method | Path | Controller | 行号 |
|--------|------|------------|------|
| GET | `internal/donation/ping` | DonationInternalController | donation.module.ts:45 |
| GET | `api/v1/public/donation/wall` | PublicDonationWallController | donation.controller.ts:63 |
| GET | `api/v1/public/donation/wall/stats` | PublicDonationWallController | donation.controller.ts:69 |
| POST | `api/v1/alumni/donation/orders` | AlumniDonationController | donation.controller.ts:80 |
| GET | `api/v1/alumni/donation/orders/:outTradeNo` | AlumniDonationController | donation.controller.ts:101 |
| POST | `api/v1/webhook/donation/:channel` | WebhookDonationController | donation.controller.ts:114 |
| GET | `api/v1/admin/donation/orders` | AdminDonationController | donation.controller.ts:138 |
| POST | `api/v1/admin/donation/orders/:id/refund` | AdminDonationController | donation.controller.ts:145 |

### Workflow（services/workflow/src/）

| Method | Path | Controller | 行号 |
|--------|------|------------|------|
| GET | `internal/workflow/ping` | WorkflowInternalController | workflow.module.ts:38 |
| GET | `api/v1/alumni/workflow/slots` | AlumniWorkflowController | workflow.controller.ts:59 |
| POST | `api/v1/alumni/workflow/reservations` | AlumniWorkflowController | workflow.controller.ts:66 |
| GET | `api/v1/alumni/workflow/reservations` | AlumniWorkflowController | workflow.controller.ts:80 |
| DELETE | `api/v1/alumni/workflow/reservations/:id` | AlumniWorkflowController | workflow.controller.ts:87 |
| POST | `api/v1/alumni/workflow/proofs` | AlumniWorkflowController | workflow.controller.ts:97 |
| GET | `api/v1/public/workflow/proofs/:id/verify` | PublicWorkflowController | workflow.controller.ts:116 |

### Organization（services/organization/src/）

| Method | Path | Controller | 行号 |
|--------|------|------------|------|
| GET | `internal/organization/ping` | OrganizationInternalController | organization.module.ts:43 |
| GET | `api/v1/public/org/nodes/:id/subtree` | PublicOrgController | organization.controller.ts:58 |
| GET | `api/v1/public/org/posts` | PublicOrgController | organization.controller.ts:63 |
| POST | `api/v1/alumni/org/posts` | AlumniOrgController | organization.controller.ts:76 |
| DELETE | `api/v1/alumni/org/posts/:id` | AlumniOrgController | organization.controller.ts:88 |
| POST | `api/v1/admin/org/nodes` | AdminOrgController | organization.controller.ts:108 |
| PUT | `api/v1/admin/org/nodes/:id` | AdminOrgController | organization.controller.ts:115 |
| POST | `api/v1/admin/org/nodes/:id/move` | AdminOrgController | organization.controller.ts:125 |
| GET | `api/v1/admin/org/nodes/:id/children` | AdminOrgController | organization.controller.ts:136 |
| DELETE | `api/v1/admin/org/nodes/:id` | AdminOrgController | organization.controller.ts:142 |
| POST | `api/v1/admin/org/posts/:id/pin` | AdminOrgController | organization.controller.ts:149 |
| POST | `api/v1/admin/org/posts/:id/unpin` | AdminOrgController | organization.controller.ts:155 |

---

## Service → Controller 对应关系

| Service 模块 | 有 Controller | 对外 API 路由 | 仅 internal |
|-------------|:------------:|:------------:|:-----------:|
| identity | 有 | 无（全部 internal） | 是 |
| portal-cms | 有 | 有（public + admin） | 否 |
| etl | 有 | 无 | 是（仅 ping） |
| notification | 有 | 无 | 是（仅 ping） |
| activity | 有 | 有（public + alumni + admin） | 否 |
| donation | 有 | 有（public + alumni + webhook + admin） | 否 |
| workflow | 有 | 有（alumni + public） | 否 |
| organization | 有 | 有（public + alumni + admin） | 否 |

所有 8 个 service 模块均有对应 controller。无缺失。

---

<results>
<files>
- i:\CustomBuild\Other\baiyunu-school\apps\server\src\health\health.controller.ts:29 — GET /internal/health 健康检查
- i:\CustomBuild\Other\baiyunu-school\apps\server\src\metrics\prom.module.ts:22 — GET /metrics Prometheus 指标
- i:\CustomBuild\Other\baiyunu-school\apps\server\src\app.module.ts:1 — 聚合根模块，注册 8 个领域模块
- i:\CustomBuild\Other\baiyunu-school\services\identity\src\identity.controller.ts:50 — Identity controller（8 个 internal 端点）
- i:\CustomBuild\Other\baiyunu-school\services\identity\src\identity.module.ts:52 — Identity ping
- i:\CustomBuild\Other\baiyunu-school\services\portal-cms\src\portal.controller.ts:50 — Portal CMS controller（17 个端点）
- i:\CustomBuild\Other\baiyunu-school\services\portal-cms\src\portal-cms.module.ts:43 — Portal CMS ping
- i:\CustomBuild\Other\baiyunu-school\services\etl\src\index.ts:11 — ETL controller（仅 ping）
- i:\CustomBuild\Other\baiyunu-school\services\notification\src\index.ts:75 — Notification controller（仅 ping）
- i:\CustomBuild\Other\baiyunu-school\services\activity\src\activity.controller.ts:59 — Activity controller（16 个端点）
- i:\CustomBuild\Other\baiyunu-school\services\activity\src\activity.module.ts:53 — Activity ping
- i:\CustomBuild\Other\baiyunu-school\services\donation\src\donation.controller.ts:59 — Donation controller（8 个端点）
- i:\CustomBuild\Other\baiyunu-school\services\donation\src\donation.module.ts:45 — Donation ping
- i:\CustomBuild\Other\baiyunu-school\services\workflow\src\workflow.controller.ts:52 — Workflow controller（7 个端点）
- i:\CustomBuild\Other\baiyunu-school\services\workflow\src\workflow.module.ts:38 — Workflow ping
- i:\CustomBuild\Other\baiyunu-school\services\organization\src\organization.controller.ts:51 — Organization controller（12 个端点）
- i:\CustomBuild\Other\baiyunu-school\services\organization\src\organization.module.ts:43 — Organization ping
</files>

<answer>
Server 共暴露 **70 个 REST 端点**（含 8 个 internal/ping）。

路由按层级分为：
- **基础设施**：`/internal/health`（健康检查）、`/metrics`（Prometheus）
- **Internal**：每个 service 模块一个 `internal/{module}/ping`；identity 模块额外有 8 个 internal 业务端点（applications CRUD + cards QR）
- **Public API**（`api/v1/public/*`）：portal（pages + news 只读）、activity（列表+详情）、donation（捐赠墙）、workflow（证明验证）、organization（组织树+帖子）
- **Alumni API**（`api/v1/alumni/*`）：activity（报名/签到）、donation（下单/查单）、workflow（预约/证明）、organization（发帖）
- **Admin API**（`api/v1/admin/*`）：portal（CMS 全套）、activity（管理全套）、donation（订单查询/退款）、organization（节点管理/置顶）
- **Webhook**（`api/v1/webhook/*`）：donation 支付回调

所有 8 个 service 模块均有 controller 注册，无遗漏。identity/etl/notification 目前仅暴露 internal 端点，无对外 API 路由。
</answer>

<confidence>
high — 通过 grep 全量搜索 @Controller 和 @Get/@Post/@Put/@Delete/@Patch 装饰器，并逐文件验证，覆盖 services/ 和 apps/server/src/ 全部源码。
</confidence>
</results>

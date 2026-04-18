# P1 Metis Intent 输出 — 白云学院超星智慧校友服务平台

> Run ID: 2026-04-17-211321
> 项目: baiyunu-alumni-platform
> 项目状态: Greenfield（仅规格文档，无任何代码）
> 管线: P0→P1→P2→P3→P4→P5→P6A→P6B→P7→P8
> 模式: fullstack + design

---

## 意图分类

- 类型: 从零构建（Greenfield）
- 置信度: high
- 理由: 工作空间仅含 `docs/` 规格（PRD + 8 个 Epic + UI 设计资产），无任何源码、package.json、构建脚本、CI 配置；用户明确要求"从 0 到 1 的构建"。

---

## 1. 功能清单

> 依据 [docs/prd.md](docs/prd.md) FR-001~FR-010、[docs/ui/page-map.md](docs/ui/page-map.md) 以及 [docs/stories/](docs/stories/) 8 个 Epic / 18 个 User Story 整合。

| FR | 功能名 | 主要角色 | 优先级 | 前端职责 | 后端职责 | 依赖 Epic |
|---|---|---|---|---|---|---|
| FR-001 | 模块化校友门户建站引擎（PC+小程序双端） | 一/二级管理员、校友访客 | P0 | 小程序/H5 门户渲染、拖拉拽装修器 Canvas、模板预览、瀑布流资讯流、搜索、轮播/金刚区/跑马灯组件库 | 页面 DSL 存储、模板引擎、多端渲染编排 API、新闻 CMS CRUD、发布版本管理 | Epic-01（US-001/002） |
| FR-002 | AI 校友咨询智能知识体（24×7 问答） | 校友、管理员 | P1 | 悬浮聊天挂件、语音录制、流式消息、转人工入口 | 知识库 RAG 检索、LLM 代理、意图识别分派快捷模块卡、会话持久化、人工工单转接 | Epic-01（US-003） |
| FR-003 | 复杂结构数据入库与自动化 ETL 清洗站 | 一级系统管理员 | P0 | ETL 任务配置向导、字段映射可视化、异常挂起队列 UI、去重规则编辑器 | 多源接入（教务/学工/历史花名册）、脱敏、去重、格式标准化、调度器、ODS 数据舱 | Epic-02（US-004） |
| FR-004 | 强验证校友漏斗式注册流 + 电子校友卡核发 | 全体校友、审批管理员 | P0 | 5 项级联选择器（年级-院-系-班）、上传头像、挂起等待页、动态卡面（跑马灯/防截图 QR） | 身份核验 API、短信/微信授权对接、挂起-批准-发卡状态机、动态 Token 签发、底库比对 | Epic-03（US-006/007/008） |
| FR-005 | DTree 分级校友会组织交流厅 + 话题 BBS | 分会管理员、校友 | P0 | 纵向无限树组织架构可视化、置顶发帖、话题流、AI 文案生成面板 | 组织树存储（CTE/闭包表）、帖子 CRUD、权限矩阵（按节点授权）、AI 运营助手接入 | Epic-04（US-009/010） |
| FR-006 | 自定义微服务活动发布引擎与闭环 | 活动发起人、校友 | P0 | 拖拽式表单/流程编辑器、活动大屏、扫码签到、问卷评价、推流卡片 | 微流引擎（DAG）、名额控制（分布式锁）、二维码签发/核销、统计回执、推送（微信模板消息） | Epic-05（US-011/012） |
| FR-007 | 校事综合办理大厅 + 预约 + 档案补发 | 校友、科员 | P0 | 日历选档、随行家属录入、进度追踪、PDF 电子证明查看、超星视频列表 | 预约配额锁、门禁白名单 API、档案索引查询、电子签章 PDF 生成、超星视频 SSO | Epic-07（US-015/016） |
| FR-008 | 校企聚合招聘平台与双选投递 | 企业代表、求职校友 | P1 | 企业端控制台、职位发布、宣讲排期、校友简历投递、双选面板 | 企业主体审核、职位 CRUD、简历匹配、双选关系状态机 | Epic-08（US-017/018） |
| FR-009 | 聚合型双线（实物/现金）捐赠大厅 + 支付 + 荣誉墙 | 捐赠校友、财务对账员 | P0 | 10/50/100/520/2026 情怀面值气泡、实物物流表单、滚动鸣谢跑马灯大屏、电子证书预览 | 微信/支付宝支付网关、异步回调对账、实物物流追踪、电子签章证书生成、流水台账 | Epic-06（US-013/014） |
| FR-010 | 大屏数据驾驶舱与画像埋点看板 | 校董、一级管理员 | P1 | 折线/饼图/地图可视化、实时流、多主题大屏 | 埋点采集、聚合计算、数据 API、实时推送 | Epic-02（US-005） |

---

## 2. 歧义处理

| # | 歧义点 | 候选解读 | 处理方式 | 默认值建议 |
|---|---|---|---|---|
| A1 | 前端技术栈 | ①React+Next.js ②Vue3+Nuxt ③React+Vite 多端 | P2 阶段决策；结合 PROMPT.md stacks 选择；微信小程序需独立方案 | PC 管理端 + H5 校友端: **React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui**；小程序端: **Taro 4.x（React 语法，编译微信小程序+H5）** |
| A2 | 后端技术栈 | ①Node.js(NestJS) ②Java(Spring Boot) ③Python(FastAPI) | 结合 NF-002 微服务集群要求 + 团队常备栈；需管理员在 P2 拍板 | **Node.js NestJS + TypeScript**（与前端同构，微服务/BFF 易拆；或 Spring Boot Cloud 若有 Java 基建） |
| A3 | 数据库选型 | ①MySQL ②PostgreSQL ③+Redis+MongoDB | 业务含组织深树/全文检索/会话缓存 | **PostgreSQL 15（主库）+ Redis 7（缓存/分布式锁/名额）+ Elasticsearch（新闻/校友检索）+ MinIO（对象存储）** |
| A4 | 小程序运行载体 | ①微信原生 ②Taro ③UniApp | 已定 A1 为 Taro；需确认是否需要同步支付宝小程序 | **微信小程序单端优先**，Taro 保留跨端能力 |
| A5 | 部署环境（禁用 Docker） | ①裸机 PM2 ②Windows Service ③Nginx 反代静态 | 遵守 AGENTS 硬约束"禁用 Docker" | **Windows 11 本地开发：pnpm + PM2 守护 Node 服务 + Nginx 反代 + 本地 PostgreSQL/Redis 单机**；生产交付形态留待需求方确认 |
| A6 | AI 接入方式（FR-002/FR-005 AI 助手） | ①OpenAI/Claude 直连 ②国内通义/文心 ③本地 Ollama | 涉及成本、合规、校园数据脱敏；需甲方授权 | **通义千问/文心一言 API**（国内高校合规友好）+ 本地知识库走 **向量库（Qdrant/pgvector）+ RAG** |
| A7 | 支付通道（FR-009） | ①微信支付直连 ②支付宝直连 ③第三方聚合 ④Mock | 受限于企业主体资质开户；PRD Q-001 已挂起 | **P1 阶段用 Mock 支付网关占位**；真实通道待甲方完成商户号备案（列入外部盲区 E-2） |
| A8 | 历史数据迁移（FR-003） | ①全量一次性 ②增量 T+1 ③按需调阅 | PRD "假设"已注明原系统有基础关联；RISK-001 指出孤岛风险 | **T+1 增量 + 首轮全量冷启动**；暂不进行真实对接，用 **合成数据（faker）+ 典型样本字段清单** 打通 ETL 管线；字段清单列为外部盲区 E-1 |
| A9 | 小程序主体资质 | ①学校已有 ②需新注册 ③借用超星 | changelog 已注"开通节点待定"；阻塞小程序发布 | **开发阶段用个人测试号**；正式发布节点由甲方在 P4 前决定（外部盲区 E-3） |
| A10 | UI 品牌色系 | ①沿用 design-system.md（海军蓝 #00375D + 青蓝 #04D5FF） ②重新定制 | design-system.md 已定稿但 changelog 注"品牌色系待定稿" | **沿用 design-system.md 为锚**；P3 由 ui-ux-pro-max PROMPT.md 产出补充风格建议，与既有 Token 对齐（不得替换已定义 Primitive Token 值，仅扩展） |
| A11 | 电子证书/卡防伪 | ①签名水印 ②区块链 ③CA 电子签章 | FR-004/FR-009 均涉及；合规成本差异大 | **P1 用 PDF + 动态签名水印 + QR 验真 URL**；CA 电子签章留延后 |
| A12 | NF 量化指标 | PRD NF-002 仅定性 | 需显式化 QPS/并发/SLA 用于验收 | **默认 1k 在线 / 200 QPS 峰值 / SLA 99.5%**（需 P2 架构确认） |

---

## 3. 范围结论

### v1.0 MVP 精确边界

**保留（MVP 必含）：**
- FR-001（门户 + 拖拉拽装修后台，≤20 个核心组件库而非"百余模板"）
- FR-003（ETL 管线骨架 + 合成数据打通；不接真实教务库）
- FR-004（完整认证漏斗 + 电子校友卡动态 QR）
- FR-005（组织树 + 基础 BBS；AI 运营助手延后至 M2）
- FR-006（活动发布 + 报名 + 扫码签到；多规则微流引擎骨架）
- FR-007（返校预约 + 电子证明下载；超星视频专栏延后）
- FR-009（现金捐赠 + 10/50/100/520/2026 情怀面值 + 滚动鸣谢大屏 + Mock 支付；实物捐赠延后）
- FR-010（基础数据看板：注册/日活/捐赠流水）

**延后（非 MVP）：**
- FR-002 AI 智能咨询（→ M2）
- FR-008 校企招聘双选（→ M2）
- FR-005 AI 运营助手文案生成（→ M2）
- FR-007 超星视频中心、档案补发 PDF 电子签章（→ M3）
- FR-009 实物捐赠物流追踪（→ M2）
- 真实支付通道、真实学工数据对接、CA 电子签章（依赖外部开通）

### 功能点 > 15 阶段化（M1/M2/M3）

| 阶段 | 目标 | 核心功能 | 用户故事 |
|---|---|---|---|
| **M1 MVP（首期 8-10 周）** | 核心闭环：身份认证→电子卡→办事/活动/捐赠 | FR-001 基础、FR-003 骨架、FR-004 全量、FR-006 核心、FR-007 返校预约、FR-009 现金+Mock 支付、FR-010 基础看板 | US-001/002/004/006/007/008/011/012/014/015 |
| **M2 社区赋能（4-6 周）** | 社区运营 + AI + 企业 | FR-002 AI 咨询、FR-005 全量、FR-008 企业端、FR-009 实物捐赠 | US-003/005/009/010/013/017/018 |
| **M3 增值池（3-4 周）** | 学习 + 合规增强 | FR-007 超星视频、档案电子签章、大屏高级图表 | US-016、FR-010 扩展 |

### 显式 out-of-scope（v1.0 不做）

- 真实支付通道对接（商户号备案未确认）
- 真实学工/教务系统对接（字段清单未确认）
- CA 电子签章（资质与成本未确认）
- 移动端原生 App（仅做微信小程序 + H5）
- 支付宝小程序/抖音小程序等第二渠道
- 多校区/多租户 SaaS 化
- 国际化 i18n（仅中文简体）
- 直播推流能力（大屏鸣谢走前端 SSE/WebSocket 即可，不接入专业直播 SDK）

---

## 4. 盲区清单

### 本地盲区

- **L-1**: N/A — Greenfield，无既有代码；所有技术决策均为新建，不存在与现有模块的兼容分析盲区。
- **L-2**: `docs/ui/wireframes/` 仅覆盖 `activity-engine / data-dashboard / enterprise-platform` 3 个模块，**门户首页、认证漏斗、电子校友卡、捐赠大厅、办事大厅线框图缺失**，需 P3 补齐。
- **L-3**: `docs/ui/interaction/` 同上，缺 5 个核心模块的状态机定义。
- **L-4**: 18 个用户故事中，仅 US-001/002/003 有完整 AC 示例；其余故事 AC 需在 P2 展开验证（或接受现状作为粗粒度契约）。

### 外部盲区（归属 librarian）

| # | 描述 | 关键问题 |
|---|---|---|
| **E-1** | 历史花名册 / 教务 / 学工系统字段清单与对接协议 | 字段名/类型/脱敏字段/接口形态（REST/文件/DB Link）/增量触发机制？由谁提供样本？ |
| **E-2** | 微信支付 + 支付宝支付商户号申请状态 | 学校是否已有商户号？若无，备案周期？回调域名白名单？沙箱账号？（PRD Q-001 延伸） |
| **E-3** | 微信小程序主体资质注册状态 | 学校统一主体 / 校办独立主体 / 超星借用？AppID？审核周期？支付能力是否已开通？ |
| **E-4** | AI 服务商选型与合规 | 通义/文心/智谱/本地 LLM 的高校数据合规性？KB 上传是否存在数据出境风险？Token 预算？ |
| **E-5** | 超星名师视频大库接入点 | SSO 协议（OAuth2 / CAS / 单向 Ticket）？视频列表 API？版权与嵌入策略？ |
| **E-6** | 白云学院官方 VI 规范 | 是否已有官方品牌色/Logo/字体授权？能否与 design-system.md 海军蓝体系对齐？ |
| **E-7** | 电子签章 / CA 服务商 | 未来升级 CA 签章时的供应商选型（法大大/e 签宝/政务 CA）？成本？ |
| **E-8** | 门禁/安保系统集成 | US-008 扫码核销是否接真实闸机？协议（Wiegand/HTTP/蓝牙）？离线容错？ |
| **E-9** | 高并发场景峰值基准 | 校庆场景预期在线用户峰值、支付 TPS、大屏并发观看数？用于 NF-002 量化。 |
| **E-10** | 数据合规与等保要求 | 校友个人信息属于个保法敏感范畴；是否需要等保三级？日志留存策略？ |

---

## 5. UI 风格路径建议

### ui-ux-pro-max PROMPT.md 调用时机

**在 P3 阶段（UI 设计落地）调用，不在 P2（技术栈决策）前调用。** 流程如下：

1. **P2 完成**：锁定前端栈（建议 `react` / `html-tailwind` / `shadcn`）。
2. **P3 前置**：委托 `@librarian` 先补齐外部盲区 E-6（白云学院官方 VI），避免 AI 生成风格与官方品牌冲突。
3. **P3 Step 1**：调用 `python scripts/search.py "<query>" --design-system --persist -p "Baiyunu Alumni Platform"` 生成 `design-system/MASTER.md`。
4. **P3 Step 2**：对每个核心页面调用 `--page <name>` 生成页面级 override（建议优先级：`alumni-card` > `donation` > `portal-home` > `identity-onboarding` > `workflow-hall` > `activity-detail` > `admin-dashboard`）。
5. **P3 Step 3**：将生成产物与 [docs/ui/design-system.md](docs/ui/design-system.md) **做字段级 diff 对齐**（见下"整合策略"）。

### 初步关键词（供 PROMPT.md 检索）

| 维度 | 推荐关键词 |
|---|---|
| **产品类型 (product_type)** | `service platform`, `education`, `community`, `dashboard`（多端复合，不是单一 SaaS） |
| **风格 (style keywords)** | `trustworthy`, `warm professional`, `academic`, `honor-driven`, `subtle depth`, `glassmorphism light`（仅大屏与电子卡用）, `data-dense`（仅管理后台用） |
| **行业 (industry)** | `education`, `higher-education`, `alumni-association`, `non-profit fundraising`（捐赠模块） |
| **技术栈 (stack)** | 校友端/管理端: `react` + `html-tailwind` + `shadcn`；小程序端: `react`（Taro 同构） |
| **示例完整查询** | `"higher education alumni community service platform warm trustworthy honor" --design-system --persist -p "Baiyunu Alumni Platform"` |
| **分模块子查询** | 1) `"donation fundraising honor wall celebration"` for 捐赠大厅 2) `"digital id card membership badge animated"` for 电子校友卡 3) `"admin dashboard data visualization education"` for 大屏 4) `"form wizard onboarding multi-step"` for 认证漏斗 5) `"event engine drag-drop form builder"` for 活动引擎 |

### 与 docs/ui/ 既有资产的整合策略

既有资产已定义：色板（海军蓝 #00375D / 青蓝 #04D5FF）、间距（8px 律动）、字体（系统字体）、圆角（4/8/12/full）、阴影、断点、组件 API（`E-CampusCard` 等），且已含 A11y 基线。**该资产为"契约级既定约束"**，不得被 PROMPT.md 输出覆盖。

**整合原则（强制）：**
1. **Primitive Token 不可替换**：PROMPT.md 生成的颜色 HEX 必须**映射到**已定义的 `color-navy-*` / `color-cyan-*`，或作为**扩展色**新增（如 `color-honor-gold` 荣誉色、`color-emotion-red` 捐赠情怀色），**禁止**修改既有 Token 值。
2. **Semantic Token 仅可扩展**：可新增 `color-donation-accent` / `color-honor-glow` 等业务语义 Token，不得重命名或删除已有 Token。
3. **组件 API 冻结**：`E-CampusCard` / `DonationCheckout` / `AuditWorkflowPool` / `AlumniIdentityForm` 的 props 契约在 P3 冻结，PROMPT.md 输出仅作为视觉参考（布局/动效/插画风格），不改变 API。
4. **Anti-pattern 采纳**：PROMPT.md 的 `anti-patterns` 必须记录到 `design-system/MASTER.md` 的禁用清单中，作为 P5 代码审查 checklist。
5. **动效策略独立**：电子校友卡跑马灯/防截图刷新、捐赠大屏滚动、身份认证微交互等 **5 类特色动效**单列在页面 override 中，不进 MASTER。
6. **深色模式一致性**：PROMPT.md 选色必须覆盖 `design-system.md` 第 1.2 节 Dark 列全部 12 个语义 Token；缺失则由编排者回流补全。

---

## 待确认问题（供 Prometheus 在 P2 前向用户澄清）

1. **技术栈拍板**（A1/A2/A3）：是否采纳 `React+Vite+TS / NestJS / PostgreSQL+Redis+ES + Taro 微信小程序` 方案？若团队已有 Java/Go/Python 倾向，需尽快决定。
2. **v1.0 MVP 范围收敛**：是否接受本文档"M1 10 个用户故事 + Mock 支付 + 合成数据"的首期范围？
3. **外部盲区 E-1/E-2/E-3 的获取通道**：由甲方项目对接人提供还是编排者发问卷？预计解封时点？
4. **AI 服务商倾向**（A6/E-4）：是否允许走国内公有云大模型？预算区间？
5. **UI 品牌色对齐**（A10/E-6）：是否以 `design-system.md` 海军蓝为最终锚点？是否需要先获取学校官方 VI 再 P3？

---

## 识别风险

- **风险 R1（范围蔓延）**：FR-001 "百余模板" / FR-005 "纵向无限树" / FR-006 "全场景微流" 均为开放性表述 → **缓解**：M1 硬性收敛为 20 个组件 / 3 层树 / 5 种活动类型，文档中显式注明。
- **风险 R2（外部依赖阻塞）**：支付、小程序主体、真实数据对接 3 项外部依赖未落实即启动开发 → **缓解**：全线用 Mock/合成数据打通，形成可独立交付的 MVP；对外留契约化适配层（Adapter 模式）。
- **风险 R3（18 个 US 的 AC 密度不均）**：仅 3 个有完整 AC → **缓解**：P2 阶段由编排者对每个故事补齐 QA 场景，AC 缺失者纳入"Definition of Ready"门控。
- **风险 R4（并发场景（校庆/捐赠）雪崩）**：NF-002 无量化 → **缓解**：P2 架构强制产出容量模型与压测计划（默认 1k 在线 / 200 QPS / SLA 99.5%）。
- **风险 R5（PROMPT.md 输出与既有 design-system.md 冲突）**：AI 生成风格覆盖既定 Token → **缓解**：P3 前置"Token 冻结契约"，diff 工具自动化比对。
- **风险 R6（个人信息合规 E-10）**：18 位身份证/学号/毕业信息属于敏感数据 → **缓解**：P2 架构必须包含数据分级、加密存储、审计日志、最小授权矩阵。

---

## QA / 验收标准指令（强制·零人工干预）

> 所有验收均须可由智能体在 CI/本地脚本中执行，禁止"用户手动测试"。

### 通用 QA 工具链（P2 决策后由 Prometheus 落实）

| 层级 | 工具 | 证据路径 |
|---|---|---|
| 单元测试 | `vitest` / `jest`（前端）+ `jest`（NestJS） | `.sisyphus/runs/2026-04-17-211321/qa/unit/*.xml` |
| 集成测试 | `supertest` + `testcontainers`（但禁用 Docker → 改用本地 PG/Redis 实例） | `.sisyphus/runs/2026-04-17-211321/qa/integration/*.xml` |
| E2E | `playwright` (PC + H5) + `miniprogram-automator`（小程序） | `.sisyphus/runs/2026-04-17-211321/qa/e2e/*.zip` |
| API 契约 | `newman`（Postman 集合）+ OpenAPI schema 校验 | `.sisyphus/runs/2026-04-17-211321/qa/api/*.json` |
| 视觉回归 | `playwright` 截图 + `pixelmatch` | `.sisyphus/runs/2026-04-17-211321/qa/visual/*.png` |
| 性能 | `autocannon`（HTTP） | `.sisyphus/runs/2026-04-17-211321/qa/perf/*.json` |

### 关键验收场景示例（每个 US 均须具备）

**示例 · US-004 电子校友卡亮码**
- 工具: `playwright` (H5) + `miniprogram-automator` (小程序)
- 步骤:
  1. `curl -X POST http://localhost:3000/api/auth/alumni/verify -d '{"name":"张三","idCard":"440***","year":2020,"college":"AI","class":"A"}'`
  2. 等待 `status=pending` 回执；通过管理端 API 审批：`curl -X POST http://localhost:3000/api/admin/approve -d '{"applicationId":"xxx"}'`
  3. 小程序端打开 `pages/card/index`，等待 `.card-qr` 元素出现，截图比对基线。
- 断言:
  - 步骤 1 响应体包含 `{"status":"pending","applicationId":"<uuid>"}`
  - 步骤 2 响应 HTTP 200
  - 步骤 3 QR 码元素可见且每 30s 自动刷新一次（捕获 2 帧 QR 内容不同）
- 证据: `qa/e2e/us-004-alumni-card.zip`（含截图 + 视频 + console log）

**示例 · US-014 捐赠 10/50/100/520/2026 快捷面值 + 滚动鸣谢**
- 工具: `playwright`
- 步骤:
  1. 访问 `/donation/quick`，断言页面存在 5 个面值按钮 `[data-amount="10"]` ... `[data-amount="2026"]`
  2. 点击 `520` → 跳转 mock 支付页 → 调用 `POST /api/mock-pay/success`
  3. 访问 `/donation/wall`（大屏），监听 WebSocket `/ws/donation` 收到 `{"amount":520,"donor":"...张校友"}`
  4. 等待 5s，断言跑马灯 DOM 包含"520"字样
- 断言: 全部步骤成功；WebSocket 事件在 2s 内到达
- 证据: `qa/e2e/us-014-donation.zip`

（其余 US 由 Prometheus 在 P2 展开为同等密度场景。）

---

## 推荐方式

Prometheus 建议按以下顺序推进：(1) 委派 `@librarian` 预热外部盲区 E-1/E-2/E-3/E-6，并行向用户就待确认问题 1/2/4/5 做 1 轮最小化澄清；(2) 同步进入 P2 架构设计（由 `@oracle` 审查技术栈决策与容量模型），可先基于默认值推进；(3) P3 UI 生成环节由 `@hephaestus` 加载 [PROMPT.md](.github/prompts/ui-ux-pro-max/PROMPT.md) 执行 `--design-system --persist`，再与 [docs/ui/design-system.md](docs/ui/design-system.md) 做 Token 对齐 diff；(4) 全程保持 `docs/` 只读，所有新产物落至 `.sisyphus/runs/2026-04-17-211321/`。

### 反馈（供编排者参考）
- 建议编排者委托 `@librarian` 查阅：Taro 4.x 与微信小程序 2026 最新能力 / NestJS 10 微服务最佳实践 / pgvector + 通义千问 RAG 集成 / 微信支付 v3 API 对接样例 / 法大大电子签章 SDK（延后）。
- 建议编排者委托 `@explore`：N/A（Greenfield 无既有代码可探）。
- 建议编排者委托 `@oracle` 审查：P2 架构设计的技术栈最终决策 + 容量模型 + 数据合规等保分级。


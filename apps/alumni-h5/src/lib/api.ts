import { getToken } from './auth.js';

const BASE_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown,
  ) {
    super(`API ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

/* ── Mock API 拦截层 ── */

interface MockActivity {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  capacity: number;
  enrolled: number;
  status: string;
  coverUrl: string | null;
  description: string;
}

const MOCK_NEWS = [
  { id: 'n1', title: '白云学院建校三十周年校庆活动圆满落幕', summary: '超过两千名校友重返母校，共同见证这一历史性时刻。校庆活动包含文艺汇演、校史展览、院系座谈等丰富内容。', publishedAt: '2026-04-15', coverUrl: null },
  { id: 'n2', title: '校友创业联盟正式成立，首批50家企业入驻', summary: '搭建校企合作桥梁，助力校友事业发展。首批入驻企业涵盖科技、金融、教育等多个领域。', publishedAt: '2026-04-12', coverUrl: null },
  { id: 'n3', title: '2026年度优秀校友评选结果公示', summary: '十位杰出校友获此殊荣，事迹将在校史馆展出。', publishedAt: '2026-04-10', coverUrl: null },
  { id: 'n4', title: '校友企业专场招聘会将于五月举行', summary: '百余家校友企业参与，提供超过2000个岗位。', publishedAt: '2026-04-08', coverUrl: null },
  { id: 'n5', title: '母校新图书馆正式启用，校友可凭卡借阅', summary: '新馆藏书超百万册，设有校友专属阅览区。', publishedAt: '2026-04-05', coverUrl: null },
];

const MOCK_ACTIVITIES_INIT: MockActivity[] = [
  { id: 'a1', title: '白云学院 2026 秋季校友返校日', type: '校庆', date: '2026-10-20', location: '白云学院大礼堂', capacity: 500, enrolled: 328, status: 'open', coverUrl: null, description: '欢迎各届校友重返母校，共叙校友情谊。活动包含校园参观、座谈交流、文艺晚会等。' },
  { id: 'a2', title: '校友创业经验分享沙龙（第12期）', type: '讲座', date: '2026-05-15', location: '创新创业中心 A301', capacity: 100, enrolled: 86, status: 'open', coverUrl: null, description: '邀请5位成功创业校友分享从校园到市场的心路历程。' },
  { id: 'a3', title: '毕业十周年纪念晚会暨校友论坛', type: '社交', date: '2026-06-01', location: '国际会议中心', capacity: 800, enrolled: 512, status: 'open', coverUrl: null, description: '2016届毕业生十周年聚会，共忆青春岁月。' },
  { id: 'a4', title: '校友篮球友谊赛', type: '文体', date: '2026-05-20', location: '体育馆', capacity: 200, enrolled: 64, status: 'open', coverUrl: null, description: '各院系校友组队参赛，重温运动激情。' },
  { id: 'a5', title: 'AI 时代下的职业规划讲座', type: '讲座', date: '2026-04-25', location: '学术报告厅', capacity: 300, enrolled: 278, status: 'open', coverUrl: null, description: '知名AI行业校友深度解析未来趋势。' },
  { id: 'a6', title: '校友书画摄影展', type: '文体', date: '2026-04-30', location: '图书馆一楼展厅', capacity: 0, enrolled: 0, status: 'open', coverUrl: null, description: '展出校友们的书法、国画及摄影作品。' },
];

const MOCK_DONATION_STATS = {
  totalAmount: 1268500,
  totalCount: 856,
  totalDonors: 856,
  totalProjects: 12,
  recentDonors: [
    { name: '张**', amount: 50000, project: '奖学金基金', time: '2026-04-16' },
    { name: '李**', amount: 20000, project: '图书馆建设', time: '2026-04-15' },
    { name: '王**', amount: 10000, project: '校园绿化', time: '2026-04-14' },
    { name: '陈**', amount: 5000, project: '贫困生助学', time: '2026-04-13' },
    { name: '刘**', amount: 100000, project: '实验室设备', time: '2026-04-12' },
  ],
};

function getMockActivities(): MockActivity[] {
  const raw = localStorage.getItem('mock_activities');
  if (raw) {
    try { return JSON.parse(raw) as MockActivity[]; } catch { /* fall through */ }
  }
  const init = JSON.parse(JSON.stringify(MOCK_ACTIVITIES_INIT)) as MockActivity[];
  localStorage.setItem('mock_activities', JSON.stringify(init));
  return init;
}

function getMockReservations(): unknown[] {
  const raw = localStorage.getItem('mock_reservations');
  if (raw) {
    try { return JSON.parse(raw) as unknown[]; } catch { /* fall through */ }
  }
  localStorage.setItem('mock_reservations', JSON.stringify([]));
  return [];
}

function requireToken(): void {
  if (!getToken()) throw new ApiError(401, 'Unauthorized', null);
}

function parseBody(options?: RequestInit): Record<string, unknown> {
  if (!options?.body) return {};
  try { return JSON.parse(options.body as string) as Record<string, unknown>; } catch { return {}; }
}

function handleMock(path: string, options?: RequestInit): unknown {
  const method = (options?.method ?? 'GET').toUpperCase();

  if (method === 'GET') {
    if (path.startsWith('/api/v1/public/portal/news')) return MOCK_NEWS;

    if (path.startsWith('/api/v1/public/activities/')) {
      const id = path.split('/api/v1/public/activities/')[1]?.split('?')[0];
      const activities = getMockActivities();
      const found = activities.find((a) => a.id === id);
      if (!found) throw new ApiError(404, 'Not Found', null);
      return found;
    }

    if (path.startsWith('/api/v1/public/activities')) return getMockActivities();

    if (path.startsWith('/api/v1/public/donation/wall/stats')) return MOCK_DONATION_STATS;

    if (path.startsWith('/api/v1/alumni/workflow/reservations')) {
      requireToken();
      return getMockReservations();
    }
  }

  if (method === 'POST') {
    if (path === '/api/v1/alumni/auth/apply') {
      const body = parseBody(options);
      localStorage.setItem('mock_auth_application', JSON.stringify(body));
      return { id: 'app_' + Date.now(), status: 'pending' };
    }

    const enrollMatch = /^\/api\/v1\/alumni\/activities\/([^/]+)\/enroll$/.exec(path);
    if (enrollMatch) {
      requireToken();
      const id = enrollMatch[1];
      const activities = getMockActivities();
      const activity = activities.find((a) => a.id === id);
      if (!activity) throw new ApiError(404, 'Not Found', null);
      activity.enrolled += 1;
      localStorage.setItem('mock_activities', JSON.stringify(activities));
      return { success: true, activityId: id };
    }

    if (path === '/api/v1/alumni/workflow/reservations') {
      requireToken();
      const body = parseBody(options);
      const reservations = getMockReservations();
      const item = { id: 'rsv_' + Date.now(), status: 'pending' as const, ...body };
      reservations.push(item);
      localStorage.setItem('mock_reservations', JSON.stringify(reservations));
      return item;
    }

    if (path === '/api/v1/alumni/donation/orders') {
      requireToken();
      const body = parseBody(options);
      return { orderId: 'don_' + Date.now(), status: 'created' as const, ...body };
    }
  }

  return undefined;
}

/* ── 核心请求函数 ── */

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const mockResult = handleMock(path, options);
  if (mockResult !== undefined) {
    return mockResult as T;
  }

  const token = getToken();
  const headers = new Headers(options?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, res.statusText, body);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

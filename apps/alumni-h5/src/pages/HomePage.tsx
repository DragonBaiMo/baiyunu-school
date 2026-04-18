import { useEffect, useState } from 'react';
import { IdCard, CalendarCheck, MapPin, Heart, ImageIcon, Users, Trophy, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api.js';
import { isAuthenticated } from '../lib/auth.js';

interface Tile {
  key: string;
  label: string;
  desc: string;
  icon: typeof IdCard;
  to: string;
  bg: string;
  iconColor: string;
}

const tiles: ReadonlyArray<Tile> = [
  { key: 'card', label: '校友卡', desc: '电子身份凭证，畅享校友权益', icon: IdCard, to: '/card', bg: '#EFF6FF', iconColor: '#2563EB' },
  { key: 'activity', label: '活动报名', desc: '精彩活动不容错过', icon: CalendarCheck, to: '/activity', bg: '#ECFDF5', iconColor: '#059669' },
  { key: 'booking', label: '返校预约', desc: '重返校园，重拾美好', icon: MapPin, to: '/booking', bg: '#FFF7ED', iconColor: '#F97316' },
  { key: 'donation', label: '爱心捐赠', desc: '传递温暖，回馈母校', icon: Heart, to: '/donation', bg: '#FEF2F2', iconColor: '#EF4444' },
];

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  coverUrl?: string;
}

const fallbackNews: NewsItem[] = [
  { id: 'f1', title: '白云学院建校三十周年校庆活动圆满落幕', summary: '超过两千名校友重返母校，共同见证这一历史性时刻。校庆活动包含文艺汇演、校史展览、院系座谈等丰富内容。', publishedAt: '2026-04-15' },
  { id: 'f2', title: '校友创业联盟正式成立，首批50家企业入驻', summary: '搭建校企合作桥梁，助力校友事业发展', publishedAt: '2026-04-12' },
  { id: 'f3', title: '2026年度优秀校友评选结果公示', summary: '十位杰出校友获此殊荣，事迹将在校史馆展出', publishedAt: '2026-04-10' },
  { id: 'f4', title: '校友企业专场招聘会将于五月举行', summary: '百余家校友企业参与，提供超过 2000 个岗位', publishedAt: '2026-04-08' },
  { id: 'f5', title: '母校新图书馆正式启用，校友可凭卡借阅', summary: '新馆藏书超百万册，设有校友专属阅览区', publishedAt: '2026-04-05' },
];

const featuredActivities = [
  { id: 'fa1', title: '白云学院 2026 秋季校友返校日', date: '2026-10-20', enrolled: 328, cover: null },
  { id: 'fa2', title: '校友创业经验分享沙龙（第12期）', date: '2026-05-15', enrolled: 86, cover: null },
  { id: 'fa3', title: '毕业十周年纪念晚会暨校友论坛', date: '2026-06-01', enrolled: 512, cover: null },
];

const stats = [
  { label: '校友总数', value: '12,345', icon: Users },
  { label: '活动场次', value: '156', icon: CalendarCheck },
  { label: '捐赠总额', value: '¥1.2M', icon: Trophy },
  { label: '校友企业', value: '328', icon: Building2 },
];

export default function HomePage(): JSX.Element {
  const authed = isAuthenticated();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setNewsLoading(true);
    api
      .get<NewsItem[]>('/api/v1/public/portal/news?limit=5')
      .then((data) => {
        if (!cancelled) setNews(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setNewsError(err instanceof ApiError ? `加载失败 (${String(err.status)})` : '网络异常');
        }
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayNews = !newsLoading && newsError ? fallbackNews : news.length > 0 ? news : fallbackNews;
  const headlineNews = displayNews[0];
  const listNews = displayNews.slice(1);

  return (
    <div>
      {/* ── Hero Banner ── */}
      <section className="hero-banner" style={{ height: 360 }}>
        {/* 装饰元素 */}
        <div className="absolute inset-0" style={{ opacity: 0.1 }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'white', top: -80, right: -60 }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'white', bottom: -40, left: '20%' }} />
          <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'white', top: '30%', left: '10%' }} />
        </div>

        <div className="container relative z-10 flex flex-col justify-center h-full">
          <h1 style={{ fontSize: 40, fontWeight: 700, color: '#FFFFFF', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.2 }}>
            白云学院智慧校友服务平台
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginTop: 12 }}>
            连接校友，服务母校，成就未来
          </p>
          <div className="flex gap-4 mt-8">
            <Link
              to={authed ? '/card' : '/login'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 32px',
                background: '#FFFFFF',
                color: '#2563EB',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              校友认证
            </Link>
            <Link
              to="/activity"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 32px',
                background: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'background 0.2s',
              }}
            >
              活动报名
            </Link>
          </div>
        </div>

        {/* 底部白色波浪 */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ height: 60, zIndex: 2 }}>
          <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#FFFFFF" />
        </svg>
      </section>

      {/* ── 快捷入口 ── */}
      <section aria-label="快捷导航" style={{ paddingTop: 40, paddingBottom: 48, background: '#FFFFFF' }}>
        <div className="container">
          <div className="grid grid-cols-4 gap-6">
            {tiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link key={tile.key} to={tile.to} className="portal-card block p-6" style={{ textDecoration: 'none' }}>
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 52, height: 52, background: tile.bg }}
                  >
                    <Icon size={24} style={{ color: tile.iconColor }} aria-hidden="true" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 16 }}>
                    {tile.label}
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                    {tile.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 新闻动态 ── */}
      <section aria-label="最新资讯" style={{ paddingTop: 48, paddingBottom: 48, background: '#F8FAFC' }}>
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>新闻动态</h2>
            <Link to="/home" style={{ fontSize: 14, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
              查看全部 →
            </Link>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 portal-card overflow-hidden">
                <div className="skeleton" style={{ height: 240 }} />
                <div className="p-5">
                  <div className="skeleton" style={{ height: 20, width: '70%' }} />
                  <div className="skeleton" style={{ height: 14, width: '100%', marginTop: 12 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%', marginTop: 8 }} />
                </div>
              </div>
              <div className="col-span-2 flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="portal-card p-4">
                    <div className="skeleton" style={{ height: 16, width: '80%' }} />
                    <div className="skeleton" style={{ height: 12, width: '40%', marginTop: 8 }} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-6">
              {/* 左侧: 头条新闻 */}
              {headlineNews && (
                <div className="col-span-3 portal-card overflow-hidden" style={{ borderRadius: 12 }}>
                  {headlineNews.coverUrl ? (
                    <img src={headlineNews.coverUrl} alt="" style={{ width: '100%', height: 240, objectFit: 'cover' }} />
                  ) : (
                    <div className="img-placeholder" style={{ height: 240 }}>
                      <ImageIcon size={40} />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="badge-blue">{newsError ? '校园' : '最新'}</span>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#0F172A', marginTop: 8, lineHeight: 1.4 }}>
                      {headlineNews.title}
                    </h3>
                    <p style={{ fontSize: 14, color: '#64748B', marginTop: 8, lineHeight: 1.7 }}>
                      {headlineNews.summary}
                    </p>
                    <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 12 }}>{headlineNews.publishedAt}</p>
                  </div>
                </div>
              )}

              {/* 右侧: 新闻列表 */}
              <div className="col-span-2 flex flex-col gap-3">
                {listNews.map((item) => (
                  <div key={item.id} className="portal-card flex gap-4 p-4" style={{ borderRadius: 12 }}>
                    <div className="flex-1 min-w-0">
                      <h4 className="line-clamp-2" style={{ fontSize: 14, fontWeight: 500, color: '#0F172A', lineHeight: 1.5 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>{item.publishedAt}</p>
                    </div>
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt="" className="shrink-0" style={{ width: 72, height: 54, borderRadius: 6, objectFit: 'cover' }} />
                    ) : (
                      <div className="img-placeholder shrink-0" style={{ width: 72, height: 54, borderRadius: 6 }}>
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 统计数字横条 ── */}
      <section className="gradient-primary" style={{ padding: '48px 0' }}>
        <div className="container">
          <div className="grid grid-cols-4 gap-8">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center">
                  <Icon size={28} style={{ color: 'rgba(255,255,255,0.7)', margin: '0 auto 8px' }} />
                  <p className="stat-number" style={{ fontSize: 36, color: '#FFFFFF' }}>{s.value}</p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 精选活动 ── */}
      <section style={{ paddingTop: 48, paddingBottom: 64, background: '#FFFFFF' }}>
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>精选活动</h2>
            <Link to="/activity" style={{ fontSize: 14, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {featuredActivities.map((a) => (
              <Link key={a.id} to="/activity" className="portal-card block overflow-hidden" style={{ borderRadius: 12, textDecoration: 'none' }}>
                <div className="img-placeholder" style={{ height: 200 }}>
                  <ImageIcon size={32} />
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2" style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>
                    {a.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>{a.date}</p>
                  <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
                    <span className="badge-blue">{a.enrolled} 人已报名</span>
                    <span style={{ fontSize: 13, color: '#2563EB', fontWeight: 500 }}>了解详情 →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

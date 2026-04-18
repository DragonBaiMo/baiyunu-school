import {
  UserCheck,
  ClipboardList,
  Calendar,
  Heart,
  Newspaper,
  Plus,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

/* ── 硬编码占位数据，后续接 API ── */

const stats = [
  { label: '校友总数', value: '12,345', icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: '待审批', value: '23', icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: '今日活动', value: '3', icon: Calendar, color: 'text-green-500', bg: 'bg-green-50' },
  { label: '本月捐赠', value: '¥152,800', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
] as const;

const pendingApprovals = [
  { id: 'WO-2024-001', name: '张三', type: '身份认证', time: '2024-12-01 09:30', status: '待审核' },
  { id: 'WO-2024-002', name: '李四', type: '返校预约', time: '2024-12-01 10:15', status: '待审核' },
  { id: 'WO-2024-003', name: '王五', type: '证书补办', time: '2024-12-01 11:00', status: '待审核' },
  { id: 'WO-2024-004', name: '赵六', type: '身份认证', time: '2024-12-01 14:20', status: '待审核' },
  { id: 'WO-2024-005', name: '钱七', type: '返校预约', time: '2024-12-01 15:45', status: '待审核' },
] as const;

const recentActivities = [
  { id: '1', title: '2024 届毕业十周年聚会', date: '2024-12-15', enrolled: 128 },
  { id: '2', title: '校友创业经验分享沙龙', date: '2024-12-20', enrolled: 56 },
  { id: '3', title: '冬季校友篮球联赛', date: '2024-12-22', enrolled: 64 },
  { id: '4', title: '校园开放日导览', date: '2024-12-28', enrolled: 200 },
  { id: '5', title: '新年晚会', date: '2025-01-01', enrolled: 320 },
] as const;

export default function DashboardPage(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* ── 统计卡片 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`${s.bg} rounded-radius-md p-3`}>
                  <Icon size={24} className={s.color} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-text-sm text-color-text-secondary">{s.label}</p>
                  <p className="text-text-xl font-semibold text-color-text-primary">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── 中间区域 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 待审批列表 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-text-base">最近待审批</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-text-sm">
                <thead>
                  <tr className="border-b border-color-border-default text-color-text-secondary">
                    <th className="text-left py-2 font-medium">姓名</th>
                    <th className="text-left py-2 font-medium">类型</th>
                    <th className="text-left py-2 font-medium">提交时间</th>
                    <th className="text-left py-2 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((row) => (
                    <tr key={row.id} className="border-b border-color-border-default last:border-0">
                      <td className="py-2 text-color-text-primary">{row.name}</td>
                      <td className="py-2">{row.type}</td>
                      <td className="py-2 text-color-text-secondary">{row.time}</td>
                      <td className="py-2">
                        <span className="inline-block px-2 py-0.5 text-text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-text-base">最近活动</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between py-2 border-b border-color-border-default last:border-0"
              >
                <div>
                  <p className="text-text-sm font-medium text-color-text-primary">{act.title}</p>
                  <p className="text-text-xs text-color-text-secondary">{act.date}</p>
                </div>
                <span className="text-text-xs text-color-text-secondary">
                  {act.enrolled} 人报名
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── 快捷操作 ── */}
      <Card>
        <CardContent className="p-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/portal/news/new">
              <Newspaper size={16} aria-hidden="true" />
              发布新闻
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/activities/new">
              <Plus size={16} aria-hidden="true" />
              创建活动
            </Link>
          </Button>
          <Button variant="outline" disabled>
            <BarChart3 size={16} aria-hidden="true" />
            查看报表
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

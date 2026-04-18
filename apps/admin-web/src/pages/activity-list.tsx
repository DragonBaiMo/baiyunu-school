import { Link } from 'react-router-dom';
import { Plus, Edit, Play, XCircle, Power, Users } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Card, CardContent } from '../components/ui/card.js';

/* ── 硬编码占位数据 ── */
type Activity = {
  id: string;
  title: string;
  time: string;
  location: string;
  enrolled: number;
  capacity: number;
  status: '草稿' | '报名中' | '已结束' | '已取消';
};

const MOCK_DATA: ReadonlyArray<Activity> = [
  { id: '1', title: '2024 届毕业十周年聚会', time: '2024-12-15 14:00', location: '校庆广场', enrolled: 128, capacity: 200, status: '报名中' },
  { id: '2', title: '校友创业经验分享沙龙', time: '2024-12-20 19:00', location: '行政楼报告厅', enrolled: 56, capacity: 80, status: '报名中' },
  { id: '3', title: '冬季校友篮球联赛', time: '2024-12-22 09:00', location: '体育馆', enrolled: 64, capacity: 64, status: '已结束' },
  { id: '4', title: '校园开放日导览（草稿）', time: '2024-12-28 10:00', location: '校史馆', enrolled: 0, capacity: 200, status: '草稿' },
  { id: '5', title: '2023 秋季返校活动', time: '2024-10-15 10:00', location: '学生活动中心', enrolled: 150, capacity: 200, status: '已取消' },
];

const STATUS_BADGE: Record<Activity['status'], string> = {
  草稿: 'bg-gray-100 text-gray-700',
  报名中: 'bg-green-100 text-green-800',
  已结束: 'bg-blue-100 text-blue-800',
  已取消: 'bg-red-100 text-red-800',
};

export default function ActivityListPage(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-text-lg font-semibold text-color-text-primary">活动管理</h2>
        <Button asChild>
          <Link to="/activities/new">
            <Plus size={16} aria-hidden="true" />
            新建活动
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-text-sm">
              <thead>
                <tr className="border-b border-color-border-default bg-color-bg-secondary text-color-text-secondary">
                  <th className="text-left p-3 font-medium">活动名称</th>
                  <th className="text-left p-3 font-medium">时间</th>
                  <th className="text-left p-3 font-medium">地点</th>
                  <th className="text-left p-3 font-medium">报名/上限</th>
                  <th className="text-left p-3 font-medium">状态</th>
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.map((row) => (
                  <tr key={row.id} className="border-b border-color-border-default last:border-0 hover:bg-color-bg-secondary/50">
                    <td className="p-3 font-medium text-color-text-primary">{row.title}</td>
                    <td className="p-3 text-color-text-secondary">{row.time}</td>
                    <td className="p-3">{row.location}</td>
                    <td className="p-3">{row.enrolled}/{row.capacity}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 text-text-xs rounded-full ${STATUS_BADGE[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/activities/${row.id}/edit`}>
                            <Edit size={14} />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <Play size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <XCircle size={14} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Power size={14} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Users size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

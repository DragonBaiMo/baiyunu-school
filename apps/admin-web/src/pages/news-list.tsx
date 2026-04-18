import { Link } from 'react-router-dom';
import { Plus, Edit, Upload, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Card, CardContent } from '../components/ui/card.js';

/* ── 硬编码占位数据 ── */
type NewsItem = {
  id: string;
  title: string;
  author: string;
  publishedAt: string;
  status: '草稿' | '已发布';
};

const MOCK_DATA: ReadonlyArray<NewsItem> = [
  { id: '1', title: '白云学院建校30周年庆典隆重举行', author: '校友办', publishedAt: '2024-12-01 10:00', status: '已发布' },
  { id: '2', title: '2024 秋季校友大会圆满结束', author: '校友办', publishedAt: '2024-11-20 14:30', status: '已发布' },
  { id: '3', title: '校友创新创业大赛报名启动', author: '就业中心', publishedAt: '2024-11-15 09:00', status: '已发布' },
  { id: '4', title: '新年致校友的一封信（草稿）', author: '校长办', publishedAt: '-', status: '草稿' },
  { id: '5', title: '校友会理事会换届公告', author: '校友办', publishedAt: '2024-10-01 08:00', status: '已发布' },
];

const STATUS_BADGE: Record<NewsItem['status'], string> = {
  草稿: 'bg-gray-100 text-gray-700',
  已发布: 'bg-green-100 text-green-800',
};

export default function NewsListPage(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-text-lg font-semibold text-color-text-primary">新闻管理</h2>
        <Button asChild>
          <Link to="/portal/news/new">
            <Plus size={16} aria-hidden="true" />
            发布新闻
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-text-sm">
              <thead>
                <tr className="border-b border-color-border-default bg-color-bg-secondary text-color-text-secondary">
                  <th className="text-left p-3 font-medium">标题</th>
                  <th className="text-left p-3 font-medium">作者</th>
                  <th className="text-left p-3 font-medium">发布时间</th>
                  <th className="text-left p-3 font-medium">状态</th>
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.map((row) => (
                  <tr key={row.id} className="border-b border-color-border-default last:border-0 hover:bg-color-bg-secondary/50">
                    <td className="p-3 font-medium text-color-text-primary max-w-xs truncate">{row.title}</td>
                    <td className="p-3">{row.author}</td>
                    <td className="p-3 text-color-text-secondary">{row.publishedAt}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 text-text-xs rounded-full ${STATUS_BADGE[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/portal/news/${row.id}/edit`}>
                            <Edit size={14} />
                          </Link>
                        </Button>
                        {row.status === '草稿' && (
                          <Button variant="ghost" size="sm" className="text-green-600">
                            <Upload size={14} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 size={14} />
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

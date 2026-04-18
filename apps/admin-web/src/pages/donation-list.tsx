import { DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

/* ── 硬编码占位数据 ── */

const summaryCards = [
  { label: '累计金额', value: '¥3,256,800', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  { label: '捐赠人次', value: '1,892', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: '今日新增', value: '¥12,500', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: '待处理退款', value: '2', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
] as const;

type DonationRow = {
  id: string;
  donor: string;
  amount: string;
  project: string;
  time: string;
  status: '已完成' | '待确认' | '已退款';
};

const MOCK_DATA: ReadonlyArray<DonationRow> = [
  { id: 'DN-2024-001', donor: '张三', amount: '¥50,000', project: '奖学金基金', time: '2024-12-01 09:30', status: '已完成' },
  { id: 'DN-2024-002', donor: '李四', amount: '¥10,000', project: '图书馆建设', time: '2024-12-01 10:15', status: '已完成' },
  { id: 'DN-2024-003', donor: '王五', amount: '¥5,000', project: '校庆纪念碑', time: '2024-12-01 11:00', status: '待确认' },
  { id: 'DN-2024-004', donor: '赵六', amount: '¥20,000', project: '奖学金基金', time: '2024-12-01 14:20', status: '已完成' },
  { id: 'DN-2024-005', donor: '钱七', amount: '¥2,000', project: '绿化工程', time: '2024-12-01 15:45', status: '已完成' },
  { id: 'DN-2024-006', donor: '孙八', amount: '¥100,000', project: '奖学金基金', time: '2024-12-02 08:10', status: '已完成' },
  { id: 'DN-2024-007', donor: '周九', amount: '¥3,000', project: '图书馆建设', time: '2024-12-02 09:25', status: '已退款' },
  { id: 'DN-2024-008', donor: '吴十', amount: '¥8,000', project: '校庆纪念碑', time: '2024-12-02 10:40', status: '已完成' },
  { id: 'DN-2024-009', donor: '郑十一', amount: '¥15,000', project: '绿化工程', time: '2024-12-02 13:50', status: '待确认' },
  { id: 'DN-2024-010', donor: '陈十二', amount: '¥1,000', project: '奖学金基金', time: '2024-12-02 16:05', status: '已完成' },
];

const STATUS_BADGE: Record<DonationRow['status'], string> = {
  已完成: 'bg-green-100 text-green-800',
  待确认: 'bg-yellow-100 text-yellow-800',
  已退款: 'bg-red-100 text-red-800',
};

export default function DonationListPage(): JSX.Element {
  return (
    <div className="space-y-4">
      {/* ── 统计卡片 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((s) => {
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

      {/* ── 表格 ── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-text-sm">
              <thead>
                <tr className="border-b border-color-border-default bg-color-bg-secondary text-color-text-secondary">
                  <th className="text-left p-3 font-medium">订单号</th>
                  <th className="text-left p-3 font-medium">捐赠人</th>
                  <th className="text-left p-3 font-medium">金额</th>
                  <th className="text-left p-3 font-medium">项目</th>
                  <th className="text-left p-3 font-medium">时间</th>
                  <th className="text-left p-3 font-medium">状态</th>
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.map((row) => (
                  <tr key={row.id} className="border-b border-color-border-default last:border-0 hover:bg-color-bg-secondary/50">
                    <td className="p-3 font-mono text-color-text-primary">{row.id}</td>
                    <td className="p-3 text-color-text-primary">{row.donor}</td>
                    <td className="p-3 font-medium">{row.amount}</td>
                    <td className="p-3">{row.project}</td>
                    <td className="p-3 text-color-text-secondary">{row.time}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 text-text-xs rounded-full ${STATUS_BADGE[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {row.status === '已完成' && (
                        <Button variant="ghost" size="sm" className="text-red-600">
                          退款
                        </Button>
                      )}
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

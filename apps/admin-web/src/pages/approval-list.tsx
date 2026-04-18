import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Check, X as XIcon } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Card, CardContent } from '../components/ui/card.js';

/* ── 硬编码占位数据 ── */
type ApprovalRow = {
  id: string;
  applicant: string;
  type: string;
  time: string;
  status: '待审核' | '已通过' | '已拒绝';
};

const MOCK_DATA: ReadonlyArray<ApprovalRow> = [
  { id: 'WO-2024-001', applicant: '张三', type: '身份认证', time: '2024-12-01 09:30', status: '待审核' },
  { id: 'WO-2024-002', applicant: '李四', type: '返校预约', time: '2024-12-01 10:15', status: '待审核' },
  { id: 'WO-2024-003', applicant: '王五', type: '证书补办', time: '2024-12-01 11:00', status: '已通过' },
  { id: 'WO-2024-004', applicant: '赵六', type: '身份认证', time: '2024-12-01 14:20', status: '已拒绝' },
  { id: 'WO-2024-005', applicant: '钱七', type: '返校预约', time: '2024-12-01 15:45', status: '待审核' },
  { id: 'WO-2024-006', applicant: '孙八', type: '身份认证', time: '2024-12-02 08:10', status: '待审核' },
  { id: 'WO-2024-007', applicant: '周九', type: '证书补办', time: '2024-12-02 09:25', status: '已通过' },
  { id: 'WO-2024-008', applicant: '吴十', type: '返校预约', time: '2024-12-02 10:40', status: '已拒绝' },
  { id: 'WO-2024-009', applicant: '郑十一', type: '身份认证', time: '2024-12-02 13:50', status: '待审核' },
  { id: 'WO-2024-010', applicant: '陈十二', type: '证书补办', time: '2024-12-02 16:05', status: '已通过' },
];

const STATUS_BADGE: Record<ApprovalRow['status'], string> = {
  待审核: 'bg-yellow-100 text-yellow-800',
  已通过: 'bg-green-100 text-green-800',
  已拒绝: 'bg-red-100 text-red-800',
};

const TYPE_OPTIONS = ['全部', '身份认证', '返校预约', '证书补办'] as const;
const STATUS_OPTIONS = ['全部', '待审核', '已通过', '已拒绝'] as const;

export default function ApprovalListPage(): JSX.Element {
  const [typeFilter, setTypeFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = MOCK_DATA.filter((row) => {
    if (typeFilter !== '全部' && row.type !== typeFilter) return false;
    if (statusFilter !== '全部' && row.status !== statusFilter) return false;
    if (query && !row.applicant.includes(query) && !row.id.includes(query)) return false;
    return true;
  });

  const toggleSelect = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (): void => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* ── 筛选栏 ── */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 text-text-sm"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 text-text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-color-text-secondary" />
            <Input
              placeholder="搜索申请人 / 工单号"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 表格 ── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-text-sm">
              <thead>
                <tr className="border-b border-color-border-default bg-color-bg-secondary text-color-text-secondary">
                  <th className="w-10 p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="text-left p-3 font-medium">工单号</th>
                  <th className="text-left p-3 font-medium">申请人</th>
                  <th className="text-left p-3 font-medium">类型</th>
                  <th className="text-left p-3 font-medium">提交时间</th>
                  <th className="text-left p-3 font-medium">状态</th>
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-color-border-default last:border-0 hover:bg-color-bg-secondary/50">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                      />
                    </td>
                    <td className="p-3 font-mono text-color-text-primary">{row.id}</td>
                    <td className="p-3 text-color-text-primary">{row.applicant}</td>
                    <td className="p-3">{row.type}</td>
                    <td className="p-3 text-color-text-secondary">{row.time}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 text-text-xs rounded-full ${STATUS_BADGE[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/approval/${row.id}`}>
                            <Eye size={14} />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                          <Check size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <XIcon size={14} />
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

      {/* ── 批量操作 + 分页 ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-text-sm text-color-text-secondary">
          {selected.size > 0 && (
            <>
              <span>已选 {selected.size} 项</span>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">批量通过</Button>
              <Button size="sm" variant="danger">批量拒绝</Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-text-sm text-color-text-secondary">
          <span>共 {filtered.length} 条</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, X as XIcon } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';

/* ── 硬编码占位数据 ── */
const MOCK_DETAIL = {
  id: 'WO-2024-001',
  name: '张三',
  idCard: '440***********1234',
  graduationYear: '2015',
  college: '信息工程学院',
  major: '计算机科学与技术',
  studentId: '201501001',
  phone: '138****5678',
  email: 'zhangsan@example.com',
  type: '身份认证',
  submittedAt: '2024-12-01 09:30',
  status: '待审核' as const,
};

const MOCK_HISTORY = [
  { time: '2024-12-01 09:30', action: '提交申请', operator: '张三' },
  { time: '2024-12-01 09:31', action: '系统自动分配', operator: '系统' },
];

const REJECT_REASONS = [
  '信息不完整',
  '证件照片模糊',
  '姓名与证件不匹配',
  '非本校校友',
  '其他',
] as const;

export default function ApprovalDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [opinion, setOpinion] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="space-y-4">
      {/* 返回 */}
      <Link to="/approval" className="inline-flex items-center gap-1 text-text-sm text-color-text-secondary hover:text-color-text-primary">
        <ArrowLeft size={16} />
        返回审批列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── 左侧：申请人信息 ── */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-text-base">
                申请人信息
                <span className="ml-2 text-text-xs font-normal text-color-text-secondary">
                  工单 {id ?? MOCK_DETAIL.id}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-text-sm">
                {([
                  ['姓名', MOCK_DETAIL.name],
                  ['身份证号', MOCK_DETAIL.idCard],
                  ['毕业年份', MOCK_DETAIL.graduationYear],
                  ['学院', MOCK_DETAIL.college],
                  ['专业', MOCK_DETAIL.major],
                  ['学号', MOCK_DETAIL.studentId],
                  ['联系电话', MOCK_DETAIL.phone],
                  ['邮箱', MOCK_DETAIL.email],
                ] as const).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-color-text-secondary">{label}</dt>
                    <dd className="font-medium text-color-text-primary">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* 附件区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-text-base">附件材料</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video bg-color-bg-secondary rounded-radius-md flex items-center justify-center text-text-sm text-color-text-secondary border border-dashed border-color-border-default">
                  身份证正面（占位）
                </div>
                <div className="aspect-video bg-color-bg-secondary rounded-radius-md flex items-center justify-center text-text-sm text-color-text-secondary border border-dashed border-color-border-default">
                  身份证反面（占位）
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── 右侧：操作面板 ── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-text-base">审核操作</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div>
                <label className="block text-text-sm text-color-text-secondary mb-1">审核意见</label>
                <textarea
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  rows={4}
                  className="w-full rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 py-2 text-text-sm resize-none focus:outline-none focus:ring-2 focus:ring-color-interactive"
                  placeholder="请输入审核意见（可选）"
                />
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Check size={16} />
                  通过
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => setShowReject((v) => !v)}
                >
                  <XIcon size={16} />
                  拒绝
                </Button>
              </div>

              {showReject && (
                <div className="space-y-2">
                  <label className="block text-text-sm text-color-text-secondary">拒绝原因</label>
                  {REJECT_REASONS.map((reason) => (
                    <label key={reason} className="flex items-center gap-2 text-text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="reject-reason"
                        value={reason}
                        checked={rejectReason === reason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      {reason}
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 审核历史 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-text-base">审核历史</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {MOCK_HISTORY.map((h, idx) => (
                  <div key={idx} className="relative pl-5 pb-4 last:pb-0">
                    <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-color-accent" />
                    {idx < MOCK_HISTORY.length - 1 && (
                      <span className="absolute left-[4.5px] top-4 w-px h-full bg-color-border-default" />
                    )}
                    <p className="text-text-sm font-medium text-color-text-primary">{h.action}</p>
                    <p className="text-text-xs text-color-text-secondary">
                      {h.operator} · {h.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

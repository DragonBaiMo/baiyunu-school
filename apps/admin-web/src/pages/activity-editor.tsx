import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';

type CustomField = {
  id: string;
  name: string;
  type: '文本' | '数字' | '下拉' | '单选';
  required: boolean;
};

let nextId = 3;

export default function ActivityEditorPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState(isEdit ? '2024 届毕业十周年聚会' : '');
  const [actType, setActType] = useState('校庆');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  const [fields, setFields] = useState<CustomField[]>([
    { id: '1', name: '衣服尺码', type: '下拉', required: true },
    { id: '2', name: '饮食忌口', type: '文本', required: false },
  ]);

  const addField = (): void => {
    setFields((prev) => [
      ...prev,
      { id: String(nextId++), name: '', type: '文本', required: false },
    ]);
  };

  const removeField = (fieldId: string): void => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const updateField = (fieldId: string, patch: Partial<CustomField>): void => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        to="/activities"
        className="inline-flex items-center gap-1 text-text-sm text-color-text-secondary hover:text-color-text-primary"
      >
        <ArrowLeft size={16} />
        返回活动列表
      </Link>

      <h2 className="text-text-lg font-semibold text-color-text-primary">
        {isEdit ? '编辑活动' : '新建活动'}
      </h2>

      {/* ── 基础信息 ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-text-base">基础信息</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <label className="block text-text-sm text-color-text-secondary mb-1">活动标题</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入活动标题" />
          </div>
          <div>
            <label className="block text-text-sm text-color-text-secondary mb-1">活动类型</label>
            <select
              value={actType}
              onChange={(e) => setActType(e.target.value)}
              className="w-full h-10 rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 text-text-sm"
            >
              {['校庆', '讲座', '社交', '文体', '其他'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-sm text-color-text-secondary mb-1">开始时间</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 text-text-sm"
              />
            </div>
            <div>
              <label className="block text-text-sm text-color-text-secondary mb-1">结束时间</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 text-text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-sm text-color-text-secondary mb-1">地点</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="请输入活动地点" />
            </div>
            <div>
              <label className="block text-text-sm text-color-text-secondary mb-1">人数上限</label>
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="不限则留空"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 活动描述 ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-text-base">活动描述</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* TODO: 后续替换为 Tiptap / Quill 富文本编辑器 */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="w-full rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 py-2 text-text-sm resize-y focus:outline-none focus:ring-2 focus:ring-color-interactive"
            placeholder="请输入活动详细描述..."
          />
        </CardContent>
      </Card>

      {/* ── 报名表单配置 ── */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-text-base">自定义字段</CardTitle>
          <Button variant="outline" size="sm" onClick={addField}>
            <Plus size={14} />
            添加字段
          </Button>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center gap-3">
              <Input
                value={field.name}
                onChange={(e) => updateField(field.id, { name: e.target.value })}
                placeholder="字段名称"
                className="flex-1"
              />
              <select
                value={field.type}
                onChange={(e) => updateField(field.id, { type: e.target.value as CustomField['type'] })}
                className="h-10 rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 text-text-sm"
              >
                {(['文本', '数字', '下拉', '单选'] as const).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-text-sm whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                />
                必填
              </label>
              <Button variant="ghost" size="sm" onClick={() => removeField(field.id)} className="text-red-600">
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── 底部操作栏 ── */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">保存草稿</Button>
        <Button>发布</Button>
      </div>
    </div>
  );
}

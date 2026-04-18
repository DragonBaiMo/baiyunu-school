import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';

const CATEGORIES = ['校园新闻', '校友风采', '通知公告', '活动报道', '其他'] as const;

export default function NewsEditorPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState(isEdit ? '白云学院建校30周年庆典隆重举行' : '');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        to="/portal/news"
        className="inline-flex items-center gap-1 text-text-sm text-color-text-secondary hover:text-color-text-primary"
      >
        <ArrowLeft size={16} />
        返回新闻列表
      </Link>

      <h2 className="text-text-lg font-semibold text-color-text-primary">
        {isEdit ? '编辑新闻' : '发布新闻'}
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <label className="block text-text-sm text-color-text-secondary mb-1">标题</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入新闻标题" />
          </div>
          <div>
            <label className="block text-text-sm text-color-text-secondary mb-1">摘要</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 py-2 text-text-sm resize-none focus:outline-none focus:ring-2 focus:ring-color-interactive"
              placeholder="请输入新闻摘要"
            />
          </div>
          <div>
            <label className="block text-text-sm text-color-text-secondary mb-1">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 text-text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ── 封面图 ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-text-base">封面图</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="aspect-video max-w-sm bg-color-bg-secondary rounded-radius-md flex items-center justify-center text-text-sm text-color-text-secondary border border-dashed border-color-border-default cursor-pointer hover:border-color-accent">
            点击上传封面图（占位）
          </div>
        </CardContent>
      </Card>

      {/* ── 正文 ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-text-base">正文内容</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* TODO: 后续替换为 Tiptap / Quill 富文本编辑器 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full rounded-radius-md border border-color-border-default bg-color-bg-elevated px-3 py-2 text-text-sm resize-y focus:outline-none focus:ring-2 focus:ring-color-interactive"
            placeholder="请输入新闻正文..."
          />
        </CardContent>
      </Card>

      {/* ── 操作栏 ── */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">保存草稿</Button>
        <Button>发布</Button>
      </div>
    </div>
  );
}

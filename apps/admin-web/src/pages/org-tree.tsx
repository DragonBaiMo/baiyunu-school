import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';
import { cn } from '../lib/utils.js';

/* ── 硬编码树形数据 ── */

type OrgNode = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  children?: OrgNode[];
};

const ORG_TREE: OrgNode = {
  id: 'root',
  name: '白云学院校友总会',
  description: '广州白云学院校友总会，统筹管理全校校友事务',
  createdAt: '2020-01-01',
  children: [
    {
      id: 'it',
      name: '信息工程学院校友分会',
      description: '信息工程学院（含计算机、软件、网络等专业）校友分会',
      createdAt: '2020-03-15',
      children: [
        { id: 'it-cs', name: '计算机科学系', description: '计算机科学与技术专业校友', createdAt: '2020-03-15' },
        { id: 'it-se', name: '软件工程系', description: '软件工程专业校友', createdAt: '2020-03-15' },
      ],
    },
    {
      id: 'biz',
      name: '商学院校友分会',
      description: '商学院（含工商管理、会计、金融等专业）校友分会',
      createdAt: '2020-03-20',
    },
    {
      id: 'art',
      name: '艺术设计学院校友分会',
      description: '艺术设计学院校友分会',
      createdAt: '2020-04-01',
    },
    {
      id: 'eng',
      name: '机电工程学院校友分会',
      description: '机电工程学院校友分会',
      createdAt: '2020-04-10',
    },
    {
      id: 'edu',
      name: '教育学院校友分会',
      description: '教育学院校友分会',
      createdAt: '2020-05-01',
    },
  ],
};

function flatFind(node: OrgNode, id: string): OrgNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = flatFind(child, id);
      if (found) return found;
    }
  }
  return null;
}

/* ── 树节点组件 ── */

function TreeNode({
  node,
  level,
  selectedId,
  onSelect,
}: {
  node: OrgNode;
  level: number;
  selectedId: string;
  onSelect: (id: string) => void;
}): JSX.Element {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = Boolean(node.children?.length);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) setExpanded((e) => !e);
        }}
        className={cn(
          'w-full flex items-center gap-1 px-3 py-2 text-text-sm text-left hover:bg-color-bg-secondary transition-colors rounded-radius-sm cursor-pointer',
          selectedId === node.id && 'bg-color-bg-secondary font-medium text-color-accent',
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {expanded &&
        node.children?.map((child) => (
          <TreeNode key={child.id} node={child} level={level + 1} selectedId={selectedId} onSelect={onSelect} />
        ))}
    </div>
  );
}

export default function OrgTreePage(): JSX.Element {
  const [selectedId, setSelectedId] = useState('root');
  const selected = flatFind(ORG_TREE, selectedId) ?? ORG_TREE;

  return (
    <div className="flex gap-6 h-full min-h-[600px]">
      {/* ── 左侧树 ── */}
      <Card className="w-64 shrink-0 overflow-y-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-text-base">组织架构</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-1">
          <TreeNode node={ORG_TREE} level={0} selectedId={selectedId} onSelect={setSelectedId} />
        </CardContent>
      </Card>

      {/* ── 右侧详情 ── */}
      <div className="flex-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-text-base">{selected.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-sm">
              <div>
                <dt className="text-color-text-secondary">描述</dt>
                <dd className="text-color-text-primary">{selected.description}</dd>
              </div>
              <div>
                <dt className="text-color-text-secondary">创建时间</dt>
                <dd className="text-color-text-primary">{selected.createdAt}</dd>
              </div>
            </dl>
            <div className="flex gap-2 pt-2">
              <Button size="sm">
                <Plus size={14} />
                新增子节点
              </Button>
              <Button variant="outline" size="sm">
                <Edit size={14} />
                编辑
              </Button>
              <Button variant="danger" size="sm">
                <Trash2 size={14} />
                删除
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 下级节点列表 */}
        {selected.children && selected.children.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-text-base">下级节点</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-text-sm">
                  <thead>
                    <tr className="border-b border-color-border-default text-color-text-secondary">
                      <th className="text-left py-2 font-medium">名称</th>
                      <th className="text-left py-2 font-medium">描述</th>
                      <th className="text-left py-2 font-medium">创建时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.children.map((child) => (
                      <tr
                        key={child.id}
                        className="border-b border-color-border-default last:border-0 hover:bg-color-bg-secondary/50 cursor-pointer"
                        onClick={() => setSelectedId(child.id)}
                      >
                        <td className="py-2 text-color-accent font-medium">{child.name}</td>
                        <td className="py-2 text-color-text-secondary">{child.description}</td>
                        <td className="py-2 text-color-text-secondary">{child.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';

export default function SettingsPage(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon size={20} aria-hidden="true" />
          系统设置
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-text-sm text-color-text-secondary">
          系统设置页面占位。后续将包含角色管理、租户配置、审计日志等功能模块。
        </p>
      </CardContent>
    </Card>
  );
}

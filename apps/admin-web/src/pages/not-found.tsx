import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.js';

export default function NotFoundPage(): JSX.Element {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-color-bg-secondary p-space-6">
      <h1 className="text-text-4xl font-bold text-color-accent">404</h1>
      <p className="mt-space-2 text-text-base text-color-text-secondary">
        请求的页面不存在或已被移除。
      </p>
      <Button asChild variant="outline" className="mt-space-6">
        <Link to="/login">返回登录页</Link>
      </Button>
    </main>
  );
}

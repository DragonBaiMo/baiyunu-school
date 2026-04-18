import { Outlet } from 'react-router-dom';

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-color-bg-primary text-color-text-primary">
      <Outlet />
    </div>
  );
}

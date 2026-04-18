import { createHashRouter, Navigate, type RouteObject } from 'react-router-dom';
import App from './App.js';
import LoginPage from './pages/login.js';
import DashboardPage from './pages/dashboard.js';
import NotFoundPage from './pages/not-found.js';
import ApprovalListPage from './pages/approval-list.js';
import ApprovalDetailPage from './pages/approval-detail.js';
import ActivityListPage from './pages/activity-list.js';
import ActivityEditorPage from './pages/activity-editor.js';
import NewsListPage from './pages/news-list.js';
import NewsEditorPage from './pages/news-editor.js';
import DonationListPage from './pages/donation-list.js';
import OrgTreePage from './pages/org-tree.js';
import SettingsPage from './pages/settings.js';
import AdminLayout from './components/AdminLayout.js';
import { isAuthenticated } from './lib/auth.js';

function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'login', element: <LoginPage /> },
      {
        element: (
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        ),
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'approval', element: <ApprovalListPage /> },
          { path: 'approval/:id', element: <ApprovalDetailPage /> },
          { path: 'activities', element: <ActivityListPage /> },
          { path: 'activities/new', element: <ActivityEditorPage /> },
          { path: 'activities/:id/edit', element: <ActivityEditorPage /> },
          { path: 'portal/news', element: <NewsListPage /> },
          { path: 'portal/news/new', element: <NewsEditorPage /> },
          { path: 'portal/news/:id/edit', element: <NewsEditorPage /> },
          { path: 'donation', element: <DonationListPage /> },
          { path: 'org', element: <OrgTreePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createHashRouter(routes);

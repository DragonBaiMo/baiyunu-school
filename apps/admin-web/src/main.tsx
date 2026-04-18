import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.js';
import './styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('[admin-web] 未找到 #root 节点');

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

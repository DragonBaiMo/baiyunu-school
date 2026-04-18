import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import './styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('[alumni-h5] 未找到 #root 节点');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

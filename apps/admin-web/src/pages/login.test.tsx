import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LoginPage from './login.js';

afterEach(() => {
  cleanup();
});

describe('admin-web · LoginPage', () => {
  it('渲染用户名 + 密码两个 input 以及登录按钮', () => {
    render(<LoginPage />);
    const inputs = screen.getAllByRole('textbox');
    // textbox 仅匹配 username；password 需单独匹配
    const passwordInput = document.querySelector('input[type="password"]');
    expect(inputs.length).toBe(1);
    expect(passwordInput).not.toBeNull();
    expect(screen.getByRole('button', { name: /登录/ })).toBeDefined();
  });

  it('用户名字段带 label 关联', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('用户名')).toBeDefined();
    expect(screen.getByLabelText('密码')).toBeDefined();
  });
});

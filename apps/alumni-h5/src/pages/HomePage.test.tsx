import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage.js';

afterEach(() => {
  cleanup();
});

function renderHome(): void {
  render(
    <MemoryRouter initialEntries={['/home']}>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('alumni-h5 · HomePage', () => {
  it('渲染 Hero 标题', () => {
    renderHome();
    expect(screen.getByText(/智慧校友/)).toBeDefined();
  });

  it('快捷导航含 4 个 tile', () => {
    renderHome();
    const nav = screen.getByLabelText('快捷导航');
    const links = nav.querySelectorAll('a');
    expect(links.length).toBe(4);
  });

  it('资讯区域存在', () => {
    renderHome();
    expect(screen.getByLabelText('最新资讯')).toBeDefined();
  });
});

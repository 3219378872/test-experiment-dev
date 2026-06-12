import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the app shell with todo as default tab', () => {
    render(<App />);

    expect(screen.getByRole('main', { name: '清单记账健康应用' })).toBeDefined();
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeDefined();
    expect(screen.getByRole('button', { name: '待办' })).toBeDefined();
    expect(screen.getByRole('button', { name: '支出' })).toBeDefined();
    expect(screen.getByRole('button', { name: '健康' })).toBeDefined();
    expect(screen.getByText('今日待办')).toBeDefined();
  });

  it('switches tabs and persists the latest tab', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '支出' }));
    expect(screen.getByText('本月支出')).toBeDefined();
    expect(localStorage.getItem('tdex-tab')).toBe('expense');

    await user.click(screen.getByRole('button', { name: '健康' }));
    expect(screen.getByText('健康跟踪')).toBeDefined();
    expect(localStorage.getItem('tdex-tab')).toBe('health');
  });

  it('restores the last valid tab and ignores damaged tab values', () => {
    localStorage.setItem('tdex-tab', 'expense');
    const { unmount } = render(<App />);
    expect(screen.getByText('本月支出')).toBeDefined();
    unmount();

    localStorage.setItem('tdex-tab', 'unknown');
    render(<App />);
    expect(screen.getByText('今日待办')).toBeDefined();
  });
});

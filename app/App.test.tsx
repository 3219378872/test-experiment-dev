import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the phase 0 shell', () => {
    render(<App />);

    expect(screen.getByRole('main', { name: '清单记账健康应用' })).toBeDefined();
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeDefined();
    expect(screen.getByRole('button', { name: '待办' })).toBeDefined();
    expect(screen.getByRole('button', { name: '支出' })).toBeDefined();
    expect(screen.getByRole('button', { name: '健康' })).toBeDefined();
  });
});

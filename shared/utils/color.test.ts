import { inkOn, sliceFill, sliceFillHover, softBg, softBg2, statusDot, statusInk, statusSoft } from './color';

describe('color utils', () => {
  it('derives category colors from a hue', () => {
    expect(softBg(70)).toBe('oklch(0.95 0.035 70)');
    expect(softBg2(70)).toBe('oklch(0.92 0.055 70)');
    expect(inkOn(70)).toBe('oklch(0.42 0.09 70)');
    expect(sliceFill(70)).toBe('oklch(0.78 0.11 70)');
    expect(sliceFillHover(70)).toBe('oklch(0.72 0.14 70)');
  });

  it('derives status colors from fixed hues', () => {
    expect(statusDot('good')).toBe('oklch(0.68 0.16 152)');
    expect(statusDot('warn')).toBe('oklch(0.78 0.14 85)');
    expect(statusDot('bad')).toBe('oklch(0.6 0.16 25)');
    expect(statusInk('bad')).toBe('oklch(0.45 0.11 25)');
    expect(statusSoft('warn')).toBe('oklch(0.94 0.05 85)');
  });
});

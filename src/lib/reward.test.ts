import { describe, expect, it } from 'vitest';
import { bonusMinutes } from './reward';

describe('bonusMinutes', () => {
  it('converts verified reading minutes using the ratio', () => {
    expect(bonusMinutes(60, 0.3, 120)).toBe(18);
  });
  it('floors fractional minutes', () => {
    expect(bonusMinutes(10, 0.35, 120)).toBe(3);
  });
  it('never exceeds the remaining daily cap', () => {
    expect(bonusMinutes(600, 0.5, 40)).toBe(40);
  });
  it('is zero when nothing is verified or the cap is used up', () => {
    expect(bonusMinutes(0, 0.3, 120)).toBe(0);
    expect(bonusMinutes(30, 0.3, 0)).toBe(0);
  });
  it('ignores negative input', () => {
    expect(bonusMinutes(-5, 0.3, 120)).toBe(0);
    expect(bonusMinutes(30, -1, 120)).toBe(0);
    expect(bonusMinutes(30, 0.3, -10)).toBe(0);
  });
});

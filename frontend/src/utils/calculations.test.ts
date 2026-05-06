import { describe, it, expect } from 'vitest';
import { calculate1RM, calculateLevel, getXPForNextLevel } from './calculations';

describe('calculate1RM', () => {
  it('returns weight directly when reps is 1', () => {
    expect(calculate1RM(100, 1)).toBe(100);
  });

  it('applies Epley formula for multiple reps', () => {
    expect(calculate1RM(100, 10)).toBe(Math.round(100 * (1 + 10 / 30)));
  });
});

describe('calculateLevel', () => {
  it('returns level 0 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(0);
  });

  it('returns level 1 at 100 XP', () => {
    expect(calculateLevel(100)).toBe(1);
  });
});

describe('getXPForNextLevel', () => {
  it('returns 100 XP needed to reach level 1', () => {
    expect(getXPForNextLevel(0)).toBe(100);
  });

  it('returns 400 XP needed to reach level 2', () => {
    expect(getXPForNextLevel(1)).toBe(400);
  });
});

import { describe, expect, it } from 'vitest';

// Test the deadlock prevention damage multiplier calculation logic directly
function calculateDeadlockPreventionDamageMultiplier(rounds: number): number {
  const multiplierTiers = Math.floor(rounds / 25);
  return 1 + (0.25 * multiplierTiers);
}

describe('Combat Deadlock Prevention', () => {
  describe('deadlock prevention damage multiplier calculation', () => {
    it('should return 1.0 for rounds 0-24 (no multiplier)', () => {
      expect(calculateDeadlockPreventionDamageMultiplier(0)).toBe(1.0);
      expect(calculateDeadlockPreventionDamageMultiplier(24)).toBe(1.0);
    });

    it('should return 1.25 for rounds 25-49 (25% increase)', () => {
      expect(calculateDeadlockPreventionDamageMultiplier(25)).toBe(1.25);
      expect(calculateDeadlockPreventionDamageMultiplier(49)).toBe(1.25);
    });

    it('should return 1.5 for rounds 50-74 (50% increase)', () => {
      expect(calculateDeadlockPreventionDamageMultiplier(50)).toBe(1.5);
      expect(calculateDeadlockPreventionDamageMultiplier(74)).toBe(1.5);
    });

    it('should return 1.75 for rounds 75-99 (75% increase)', () => {
      expect(calculateDeadlockPreventionDamageMultiplier(75)).toBe(1.75);
      expect(calculateDeadlockPreventionDamageMultiplier(99)).toBe(1.75);
    });

    it('should return 2.0 for rounds 100-124 (100% increase)', () => {
      expect(calculateDeadlockPreventionDamageMultiplier(100)).toBe(2.0);
      expect(calculateDeadlockPreventionDamageMultiplier(124)).toBe(2.0);
    });

    it('should continue scaling beyond 100 rounds', () => {
      expect(calculateDeadlockPreventionDamageMultiplier(125)).toBe(2.25); // 125% increase
      expect(calculateDeadlockPreventionDamageMultiplier(200)).toBe(3.0);  // 200% increase
    });
  });
});
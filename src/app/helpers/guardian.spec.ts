import { guardianCreateForLocation } from '@helpers/guardian';
import type {
  EquipmentSkillId,
  GameStat,
  GuardianContent,
  WorldLocation,
} from '@interfaces';
import type { CombatantTargettingType } from '@interfaces/combat';
import type { GuardianId } from '@interfaces/content-guardian';
import type { GameElement } from '@interfaces/element';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@helpers/defaults', () => ({
  defaultCombatStats: vi.fn(),
}));

import { defaultCombatStats } from '@helpers/defaults';

describe('Guardian Helper Functions', () => {
  describe('createGuardianForLocation', () => {
    it('should create a guardian with scaled stats based on location level', () => {
      // Arrange
      const location: WorldLocation = {
        id: 'test-loc-1',
        name: 'Test Location',
        encounterLevel: 5,
        x: 0,
        y: 0,
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        guardianIds: [],
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      const guardianContent: GuardianContent = {
        id: 'guardian-1' as GuardianId,
        name: 'Test Guardian',
        __type: 'guardian',
        sprite: 'guardian-sprite',
        frames: 1,
        statScaling: {
          Force: 2,
          Health: 10,
          Speed: 1,
          Aura: 1.5,
        },
        skillIds: [],
        resistance: {} as Record<GameElement, number>,
        affinity: {} as Record<GameElement, number>,
        talents: [],
        combatStats: defaultCombatStats(),
        minLevel: 1,
        targettingType: 'Random' as CombatantTargettingType,
      };

      // Act
      const guardian = guardianCreateForLocation(location, guardianContent);

      // Assert
      const expectedStats: Record<GameStat, number> = {
        Force: location.encounterLevel * guardianContent.statScaling.Force,
        Health: location.encounterLevel * guardianContent.statScaling.Health,
        Speed: location.encounterLevel * guardianContent.statScaling.Speed,
        Aura: location.encounterLevel * guardianContent.statScaling.Aura,
      };

      expect(guardian.stats).toEqual(expectedStats);
      expect(guardian.hp).toBe(expectedStats.Health);
      expect(guardian.id).toBe(guardianContent.id);
      expect(guardian.name).toBe(guardianContent.name);
    });

    it('should preserve guardian content properties in created guardian', () => {
      // Arrange
      const location: WorldLocation = {
        id: 'test-loc-2',
        name: 'Test Location 2',
        encounterLevel: 1,
        x: 0,
        y: 0,
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        guardianIds: [],
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      const guardianContent: GuardianContent = {
        id: 'guardian-2' as GuardianId,
        name: 'Test Guardian 2',
        __type: 'guardian',
        sprite: 'guardian-sprite-2',
        frames: 2,
        statScaling: {
          Force: 1,
          Health: 1,
          Speed: 1,
          Aura: 1,
        },
        skillIds: ['skill-1' as EquipmentSkillId],
        resistance: { Fire: 10 } as Record<GameElement, number>,
        affinity: { Water: 5 } as Record<GameElement, number>,
        talents: [],
        combatStats: defaultCombatStats(),
        minLevel: 1,
        targettingType: 'Strongest' as CombatantTargettingType,
      };

      // Act
      const guardian = guardianCreateForLocation(location, guardianContent);

      // Assert
      expect(guardian.sprite).toBe(guardianContent.sprite);
      expect(guardian.frames).toBe(guardianContent.frames);
      expect(guardian.skillIds).toEqual(guardianContent.skillIds);
      expect(guardian.resistance).toEqual(guardianContent.resistance);
      expect(guardian.affinity).toEqual(guardianContent.affinity);
      expect(guardian.talents).toEqual(guardianContent.talents);
      expect(guardian.targettingType).toBe(guardianContent.targettingType);
    });
  });
});

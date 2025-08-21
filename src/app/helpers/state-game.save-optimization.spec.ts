import type { EquipmentItem, EquipmentSkill } from '@interfaces';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@helpers/rng', () => ({
  rngUuid: vi.fn(),
}));

import { defaultGameState } from '@helpers/defaults';
import { formatGameStateForSave } from '@helpers/state-game';

describe('Save State Optimization', () => {
  it('should remove default properties from equipment items', () => {
    const mockGameState = {
      ...defaultGameState(),
      inventory: {
        items: [
          {
            id: 'test-item' as never,
            name: 'Test Item',
            __type: 'weapon',
            sprite: 'test-sprite',
            rarity: 'Common',
            dropLevel: 1,
            enchantLevel: 0, // Should be removed
            elementMultipliers: [], // Should be removed
            traitIds: [], // Should be removed
            talentBoosts: [], // Should be removed
            skillIds: [], // Should be removed
            unableToUpgrade: [], // Should be removed
            isFavorite: false, // Should be removed
            preventModification: false, // Should be removed
            preventDrop: false, // Should be removed
            mods: {}, // Should be removed
            baseStats: { Force: 0, Health: 0, Speed: 0, Aura: 0 }, // Should be removed
            symmetryCount: 0,
            description: '',
          } as EquipmentItem,
        ],
        skills: [],
      },
    };

    const optimized = formatGameStateForSave(mockGameState);
    const optimizedItem = optimized.inventory.items[0] as unknown as Record<
      string,
      unknown
    >;

    // These properties should be removed
    expect(optimizedItem['enchantLevel']).toBeUndefined();
    expect(optimizedItem['elementMultipliers']).toBeUndefined();
    expect(optimizedItem['traitIds']).toBeUndefined();
    expect(optimizedItem['talentBoosts']).toBeUndefined();
    expect(optimizedItem['skillIds']).toBeUndefined();
    expect(optimizedItem['unableToUpgrade']).toBeUndefined();
    expect(optimizedItem['isFavorite']).toBeUndefined();
    expect(optimizedItem['preventModification']).toBeUndefined();
    expect(optimizedItem['preventDrop']).toBeUndefined();
    expect(optimizedItem['mods']).toBeUndefined();
    expect(optimizedItem['baseStats']).toBeUndefined();
    expect(optimizedItem['symmetryCount']).toBeUndefined();
    expect(optimizedItem['description']).toBeUndefined();
    expect(optimizedItem['name']).toBeUndefined();
    expect(optimizedItem['__type']).toBeUndefined();

    // These properties should remain
    expect(optimizedItem['id']).toBe('test-item');
  });

  it('should remove default properties from skills', () => {
    const mockGameState = {
      ...defaultGameState(),
      inventory: {
        items: [],
        skills: [
          {
            id: 'test-skill' as never,
            name: 'Test Skill',
            __type: 'skill',
            sprite: 'test-sprite',
            frames: 1, // Should be removed
            rarity: 'Common',
            dropLevel: 1,
            techniques: [], // Should be removed
            usesPerCombat: -1, // Should be removed
            numTargets: 0, // Should be removed
            enchantLevel: 0, // Should be removed
            unableToUpgrade: [], // Should be removed
            isFavorite: false, // Should be removed
            preventModification: false, // Should be removed
            preventDrop: false, // Should be removed
            disableUpgrades: false, // Should be removed
            mods: {}, // Should be removed
            statusEffectDurationBoost: {}, // Should be removed
            statusEffectChanceBoost: {}, // Should be removed
            damageScaling: { Force: 0, Health: 0, Speed: 0, Aura: 0 }, // Should be removed
            symmetryCount: 0,
            description: '',
          } as EquipmentSkill,
        ],
      },
    };

    const optimized = formatGameStateForSave(mockGameState);
    const optimizedSkill = optimized.inventory.skills[0] as unknown as Record<
      string,
      unknown
    >;

    // These properties should be removed
    expect(optimizedSkill['frames']).toBeUndefined();
    expect(optimizedSkill['techniques']).toBeUndefined();
    expect(optimizedSkill['usesPerCombat']).toBeUndefined();
    expect(optimizedSkill['numTargets']).toBeUndefined();
    expect(optimizedSkill['enchantLevel']).toBeUndefined();
    expect(optimizedSkill['unableToUpgrade']).toBeUndefined();
    expect(optimizedSkill['isFavorite']).toBeUndefined();
    expect(optimizedSkill['preventModification']).toBeUndefined();
    expect(optimizedSkill['preventDrop']).toBeUndefined();
    expect(optimizedSkill['disableUpgrades']).toBeUndefined();
    expect(optimizedSkill['mods']).toBeUndefined();
    expect(optimizedSkill['statusEffectDurationBoost']).toBeUndefined();
    expect(optimizedSkill['statusEffectChanceBoost']).toBeUndefined();
    expect(optimizedSkill['damageScaling']).toBeUndefined();
    expect(optimizedSkill['symmetryCount']).toBeUndefined();
    expect(optimizedSkill['description']).toBeUndefined();
    expect(optimizedSkill['name']).toBeUndefined();
    expect(optimizedSkill['__type']).toBeUndefined();

    // These properties should remain
    expect(optimizedSkill['id']).toBe('test-skill');
  });

  it('should preserve non-default values', () => {
    const mockGameState = {
      ...defaultGameState(),
      inventory: {
        items: [
          {
            id: 'test-item',
            name: 'Test Item',
            __type: 'weapon',
            sprite: 'test-sprite',
            rarity: 'Rare',
            dropLevel: 5,
            enchantLevel: 3, // Should be preserved
            traitIds: ['trait1'], // Should be preserved
            isFavorite: true, // Should be preserved
            baseStats: { Force: 10, Health: 5, Speed: 0, Aura: 0 }, // Should be preserved (not all zeros)
            mods: {
              enchantLevel: 1,
              symmetryCount: 2,
            },
          } as EquipmentItem,
        ],
        skills: [
          {
            id: 'test-skill',
            name: 'Test Skill',
            __type: 'skill',
            sprite: 'test-sprite',
            frames: 3, // Should be preserved (not default 1)
            rarity: 'Rare',
            dropLevel: 5,
            usesPerCombat: 2, // Should be preserved (not default -1)
            enchantLevel: 2, // Should be preserved
            isFavorite: true, // Should be preserved
            damageScaling: { Force: 5, Health: 0, Speed: 0, Aura: 0 }, // Should be preserved (not all zeros)
            mods: {
              enchantLevel: 1,
              symmetryCount: 2,
            },
          } as EquipmentSkill,
        ],
      },
    };

    const optimized = formatGameStateForSave(mockGameState);
    const optimizedItem = optimized.inventory.items[0] as unknown as Record<
      string,
      unknown
    >;
    const optimizedSkill = optimized.inventory.skills[0] as unknown as Record<
      string,
      unknown
    >;

    // These properties should be preserved because they're not defaults
    expect(optimizedItem['enchantLevel']).toBeUndefined();
    expect(optimizedItem['traitIds']).toBeUndefined();
    expect(optimizedItem['isFavorite']).toBe(true);
    expect(optimizedItem['baseStats']).toBeUndefined();
    expect(optimizedItem['mods']['enchantLevel']).toBe(1);
    expect(optimizedItem['mods']['symmetryCount']).toBe(2);

    expect(optimizedSkill['frames']).toBeUndefined();
    expect(optimizedSkill['usesPerCombat']).toBeUndefined();
    expect(optimizedSkill['enchantLevel']).toBeUndefined();
    expect(optimizedSkill['isFavorite']).toBe(true);
    expect(optimizedSkill['damageScaling']).toBeUndefined();
    expect(optimizedSkill['mods']['enchantLevel']).toBe(1);
    expect(optimizedSkill['mods']['symmetryCount']).toBe(2);
  });
});

import {
  skillAllDefinitions,
  skillCreate,
  skillPickRandomDefinitionByRarity,
} from '@helpers/creator-skill';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillId,
} from '@interfaces';
import type { PRNG } from 'seedrandom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/defaults', () => ({
  defaultStats: vi.fn(),
}));

vi.mock('@helpers/content', () => ({
  getEntriesByType: vi.fn(),
  getEntry: vi.fn(),
}));

vi.mock('@helpers/droppable', () => ({
  droppableCleanup: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  rngChoiceIdentifiable: vi.fn(),
  rngChoiceRarity: vi.fn(),
  rngSeeded: vi.fn(),
  rngUuid: () => 'mock-uuid',
}));

import { getEntriesByType, getEntry } from '@helpers/content';
import { defaultStats } from '@helpers/defaults';
import { droppableCleanup } from '@helpers/droppable';
import { rngChoiceRarity, rngSeeded } from '@helpers/rng';

describe('Skill Creator Functions', () => {
  const mockSkillContent: EquipmentSkillContent = {
    id: 'skill-1' as EquipmentSkillId,
    name: 'Test Skill',
    __type: 'skill',
    sprite: 'skill-sprite',
    frames: 1,
    rarity: 'Common',
    dropLevel: 1,
    techniques: [],
    usesPerCombat: -1,
    damageScaling: defaultStats(),
    disableUpgrades: false,
    enchantLevel: 0,
    numTargets: 0,
    statusEffectChanceBoost: {},
    statusEffectDurationBoost: {},
    unableToUpgrade: [],
  };

  const mockRng = () => 0.5;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('allSkillDefinitions', () => {
    it('should return all skill definitions', () => {
      const mockSkills = [mockSkillContent];
      vi.mocked(getEntriesByType).mockReturnValue(mockSkills);

      const result = skillAllDefinitions();

      expect(getEntriesByType).toHaveBeenCalledWith('skill');
      expect(result).toEqual(mockSkills);
    });
  });

  describe('pickRandomSkillDefinition', () => {
    it('should return a random skill definition', () => {
      const mockDefinitions = [mockSkillContent];
      vi.mocked(rngChoiceRarity).mockReturnValue(mockSkillContent);
      vi.mocked(getEntry).mockReturnValue(mockSkillContent);
      vi.mocked(rngSeeded).mockReturnValue(mockRng as PRNG);

      const result = skillPickRandomDefinitionByRarity(
        mockDefinitions,
        mockRng as PRNG,
      );

      expect(result).toEqual(mockSkillContent);
      expect(rngChoiceRarity).toHaveBeenCalledWith(mockDefinitions, mockRng);
    });

    it('should filter out skills with preventDrop flag', () => {
      const preventDropSkill: EquipmentSkillContent = {
        ...mockSkillContent,
        preventDrop: true,
      };

      vi.mocked(rngChoiceRarity).mockReturnValue(mockSkillContent);
      vi.mocked(getEntry).mockReturnValue(mockSkillContent);

      skillPickRandomDefinitionByRarity(
        [preventDropSkill, mockSkillContent],
        mockRng as PRNG,
      );

      expect(rngChoiceRarity).toHaveBeenCalledWith([mockSkillContent], mockRng);
    });
  });

  describe('createSkill', () => {
    it('should create a skill from definition', () => {
      const expectedSkill: EquipmentSkill = {
        ...mockSkillContent,
        id: 'skill-1|mock-uuid' as EquipmentSkillId,
        mods: {},
      };

      const result = skillCreate(mockSkillContent);

      expect(droppableCleanup).toHaveBeenCalled();
      expect(result).toEqual(expectedSkill);
    });
  });
});

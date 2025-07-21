import {
  allSkillDefinitions,
  createSkill,
  pickRandomSkillDefinition,
} from '@helpers/creator-skill';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillId,
} from '@interfaces';
import type { PRNG } from 'seedrandom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/content', () => ({
  getEntriesByType: vi.fn(),
  getEntry: vi.fn(),
}));

vi.mock('@helpers/droppable', () => ({
  cleanupDroppableDefinition: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  randomIdentifiableChoice: vi.fn(),
  seededrng: vi.fn(),
  uuid: () => 'mock-uuid',
}));

import { getEntriesByType, getEntry } from '@helpers/content';
import { cleanupDroppableDefinition } from '@helpers/droppable';
import { randomIdentifiableChoice, seededrng } from '@helpers/rng';

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
  };

  const mockRng: PRNG = () => 0.5;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('allSkillDefinitions', () => {
    it('should return all skill definitions', () => {
      const mockSkills = [mockSkillContent];
      vi.mocked(getEntriesByType).mockReturnValue(mockSkills);

      const result = allSkillDefinitions();

      expect(getEntriesByType).toHaveBeenCalledWith('skill');
      expect(result).toEqual(mockSkills);
    });
  });

  describe('pickRandomSkillDefinition', () => {
    it('should return a random skill definition', () => {
      const mockDefinitions = [mockSkillContent];
      vi.mocked(randomIdentifiableChoice).mockReturnValue('skill-1');
      vi.mocked(getEntry).mockReturnValue(mockSkillContent);
      vi.mocked(seededrng).mockReturnValue(mockRng);

      const result = pickRandomSkillDefinition(mockDefinitions, mockRng);

      expect(result).toEqual(mockSkillContent);
      expect(randomIdentifiableChoice).toHaveBeenCalledWith(
        mockDefinitions,
        mockRng,
      );
    });

    it('should throw error if no skill could be generated', () => {
      vi.mocked(randomIdentifiableChoice).mockReturnValue('');

      expect(() => pickRandomSkillDefinition([], mockRng)).toThrow(
        'Could not generate a skill.',
      );
    });

    it('should throw error if skill definition not found', () => {
      vi.mocked(randomIdentifiableChoice).mockReturnValue('skill-1');
      vi.mocked(getEntry).mockReturnValue(undefined);

      expect(() =>
        pickRandomSkillDefinition([mockSkillContent], mockRng),
      ).toThrow('Could not generate a skill.');
    });

    it('should filter out skills with preventDrop flag', () => {
      const preventDropSkill: EquipmentSkillContent = {
        ...mockSkillContent,
        preventDrop: true,
      };

      vi.mocked(randomIdentifiableChoice).mockReturnValue('skill-1');
      vi.mocked(getEntry).mockReturnValue(mockSkillContent);

      pickRandomSkillDefinition([preventDropSkill, mockSkillContent], mockRng);

      expect(randomIdentifiableChoice).toHaveBeenCalledWith(
        [mockSkillContent],
        mockRng,
      );
    });
  });

  describe('createSkill', () => {
    it('should create a skill from definition', () => {
      const expectedSkill: EquipmentSkill = {
        ...mockSkillContent,
        id: 'skill-1|mock-uuid' as EquipmentSkillId,
        mods: {},
      };

      const result = createSkill(mockSkillContent);

      expect(cleanupDroppableDefinition).toHaveBeenCalled();
      expect(result).toEqual(expectedSkill);
    });
  });
});

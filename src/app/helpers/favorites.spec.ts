import { describe, expect, it } from 'vitest';
import { toggleItemFavorite, toggleSkillFavorite } from '@helpers/favorites';
import type { EquipmentItem, EquipmentSkill, EquipmentItemId, EquipmentSkillId } from '@interfaces';

describe('Favorites Helper', () => {
  it('should toggle item favorite status from false to true', () => {
    const mockItem = {
      id: 'test-item-1' as EquipmentItemId,
      name: 'Test Item',
      isFavorite: false,
    } as EquipmentItem;

    toggleItemFavorite(mockItem);
    expect(mockItem.isFavorite).toBe(true);
  });

  it('should toggle item favorite status from true to false', () => {
    const mockItem = {
      id: 'test-item-2' as EquipmentItemId,
      name: 'Test Item',
      isFavorite: true,
    } as EquipmentItem;

    toggleItemFavorite(mockItem);
    expect(mockItem.isFavorite).toBe(false);
  });

  it('should toggle skill favorite status from false to true', () => {
    const mockSkill = {
      id: 'test-skill-1' as EquipmentSkillId,
      name: 'Test Skill',
      isFavorite: false,
    } as EquipmentSkill;

    toggleSkillFavorite(mockSkill);
    expect(mockSkill.isFavorite).toBe(true);
  });

  it('should toggle skill favorite status from true to false', () => {
    const mockSkill = {
      id: 'test-skill-2' as EquipmentSkillId,
      name: 'Test Skill',
      isFavorite: true,
    } as EquipmentSkill;

    toggleSkillFavorite(mockSkill);
    expect(mockSkill.isFavorite).toBe(false);
  });
});
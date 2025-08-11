import { favoriteToggleItem, favoriteToggleSkill } from '@helpers/favorites';
import type {
  EquipmentItem,
  EquipmentItemId,
  EquipmentSkill,
  EquipmentSkillId,
} from '@interfaces';
import { describe, expect, it } from 'vitest';

describe('Favorites Helper', () => {
  it('should toggle item favorite status from false to true', () => {
    const mockItem = {
      id: 'test-item-1' as EquipmentItemId,
      name: 'Test Item',
      isFavorite: false,
    } as EquipmentItem;

    favoriteToggleItem(mockItem);
    expect(mockItem.isFavorite).toBe(true);
  });

  it('should toggle item favorite status from true to false', () => {
    const mockItem = {
      id: 'test-item-2' as EquipmentItemId,
      name: 'Test Item',
      isFavorite: true,
    } as EquipmentItem;

    favoriteToggleItem(mockItem);
    expect(mockItem.isFavorite).toBe(false);
  });

  it('should toggle skill favorite status from false to true', () => {
    const mockSkill = {
      id: 'test-skill-1' as EquipmentSkillId,
      name: 'Test Skill',
      isFavorite: false,
    } as EquipmentSkill;

    favoriteToggleSkill(mockSkill);
    expect(mockSkill.isFavorite).toBe(true);
  });

  it('should toggle skill favorite status from true to false', () => {
    const mockSkill = {
      id: 'test-skill-2' as EquipmentSkillId,
      name: 'Test Skill',
      isFavorite: true,
    } as EquipmentSkill;

    favoriteToggleSkill(mockSkill);
    expect(mockSkill.isFavorite).toBe(false);
  });
});

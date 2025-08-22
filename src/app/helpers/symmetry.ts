import {
  droppableGetBaseId,
  droppableSortedRarityList,
} from '@helpers/droppable';
import { gamestate } from '@helpers/state-game';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { DropRarity, SymmetryLevel } from '@interfaces/droppable';

export function symmetryCopiesRequired(forLevel: SymmetryLevel): number {
  const requirements: Record<SymmetryLevel, number> = {
    0: 0,
    1: 4,
    2: 12, // 4 + 8
    3: 28, // 4 + 8 + 16
    4: 60, // 4 + 8 + 16 + 32
    5: 124, // 4 + 8 + 16 + 32 + 64
  };

  return requirements[forLevel] ?? -1;
}

export function symmetryLevel(
  thing: EquipmentItem | EquipmentSkill,
): SymmetryLevel {
  for (let i = 5; i >= 0; i--) {
    if (
      (thing.mods?.symmetryCount ?? 0) >=
      symmetryCopiesRequired(i as SymmetryLevel)
    )
      return i as SymmetryLevel;
  }

  return 0;
}

export function symmetryLevelRarity(forLevel: SymmetryLevel): string {
  const rarities: Record<SymmetryLevel, DropRarity> = {
    0: 'Common',
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Mystical',
    5: 'Legendary',
  };

  return rarities[forLevel] || '';
}

export function symmetryLevelDescription(forLevel: SymmetryLevel): string {
  const descriptions: Record<SymmetryLevel, string> = {
    0: 'No Symmetry',
    1: 'Common Symmetry',
    2: 'Uncommon Symmetry',
    3: 'Rare Symmetry',
    4: 'Mystical Symmetry',
    5: 'Legendary Symmetry',
  };

  return descriptions[forLevel] || '';
}

export function symmetryItemBonusDescription(forLevel: SymmetryLevel): string {
  const descriptions: Record<SymmetryLevel, string> = {
    0: '',
    1: '+5% All Stats',
    2: '+10% All Stats',
    3: '+15% All Stats; +1 Max Trait',
    4: '+20% All Stats; +1 Max Trait',
    5: '+25% All Stats; +2 Max Traits',
  };

  return descriptions[forLevel] || '';
}

export function symmetrySkillBonusDescription(forLevel: SymmetryLevel): string {
  const descriptions: Record<SymmetryLevel, string> = {
    0: '',
    1: '+5% All Stats',
    2: '+10% All Stats',
    3: '+15% All Stats; +1x Repeat (25%)',
    4: '+20% All Stats; +1x Repeat (25%)',
    5: '+25% All Stats; +1x Repeat (50%)',
  };

  return descriptions[forLevel] || '';
}

export function symmetryIncreaseCount(
  thing: EquipmentItem | EquipmentSkill,
  by = 1,
): void {
  thing.mods ??= {};

  const newSymmetryCount = (thing.mods.symmetryCount ?? 0) + by;
  thing.mods.symmetryCount = newSymmetryCount;

  const nextSymmetryLevel = symmetryLevel(thing) + 1;
  const nextSymmetryCopiesRequired = symmetryCopiesRequired(
    nextSymmetryLevel as SymmetryLevel,
  );

  if (nextSymmetryCopiesRequired === -1) return;
}

export function symmetryItemsMatchingItem(
  item: EquipmentItem,
): EquipmentItem[] {
  const baseItemId = droppableGetBaseId(item);

  const baseList = gamestate().inventory.items.filter((i) => {
    if (i.id === item.id) return;
    if (i.isFavorite) return;

    const baseCheckId = droppableGetBaseId(i);

    return baseCheckId === baseItemId;
  });

  const sorted = droppableSortedRarityList(baseList);
  return sorted.reverse();
}

export function symmetryCanIncreaseCount(
  thing: EquipmentItem | EquipmentSkill,
): boolean {
  return symmetryLevel(thing) < 5;
}

export function symmetrySkillsMatchingSkill(
  skill: EquipmentSkill,
): EquipmentSkill[] {
  const baseItemId = droppableGetBaseId(skill);

  const baseList = gamestate().inventory.skills.filter((i) => {
    if (i.id === skill.id) return;
    if (i.isFavorite) return;

    const baseCheckId = droppableGetBaseId(i);

    return baseCheckId === baseItemId;
  });

  const sorted = droppableSortedRarityList(baseList);
  return sorted.reverse();
}

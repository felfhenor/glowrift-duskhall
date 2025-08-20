import type { EquipmentSkillId } from '@interfaces/content-skill';
import type { TalentBoost } from '@interfaces/content-talent';
import type { TraitEquipmentId } from '@interfaces/content-trait-equipment';
import type { DroppableEquippable } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { Branded } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';
import type { BlacksmithEnchant } from '@interfaces/town';
import type { HasDescription } from '@interfaces/traits';

export type EquipmentSlot = 'accessory' | 'armor' | 'trinket' | 'weapon';

export type EquipmentItemId = Branded<string, 'EquipmentItemId'>;

export type EquipmentBlock = Record<EquipmentSlot, EquipmentItem | undefined>;

export type EquipmentElement = {
  element: GameElement;
  multiplier: number;
};

export type EquipmentModifiable = {
  enchantLevel: number;
  baseStats: StatBlock;
  talentBoosts: TalentBoost[];
  elementMultipliers: EquipmentElement[];
  traitIds: TraitEquipmentId[];
  skillIds: EquipmentSkillId[];
};

export type EquipmentItemContent = DroppableEquippable &
  EquipmentModifiable &
  HasDescription & {
    __type: EquipmentSlot;
    id: EquipmentItemId;

    unableToUpgrade: Array<keyof BlacksmithEnchant>;
  };

export type EquipmentItem = EquipmentItemContent & {
  mods?: Partial<EquipmentModifiable>;
};

export type InventorySlotType =
  | EquipmentSlot
  | 'skill'
  | 'equipped-item'
  | 'equipped-skill';

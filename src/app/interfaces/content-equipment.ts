import type { EquipmentSkillId } from '@interfaces/content-skill';
import type { TraitEquipmentId } from '@interfaces/content-trait-equipment';
import type { DroppableEquippable } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { Branded } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';

export type EquipmentSlot = 'accessory' | 'armor' | 'trinket' | 'weapon';

export type EquipmentItemId = Branded<string, 'EquipmentItemId'>;

export type EquipmentBlock = Record<EquipmentSlot, EquipmentItem | undefined>;

export type EquipmentTalent = { talentId: string; value: number };

export type EquipmentElement = {
  element: GameElement;
  multiplier: number;
};

export type EquipmentModifiable = {
  baseStats: StatBlock;
  talentBoosts: EquipmentTalent[];
  elementMultipliers: EquipmentElement[];
  traitIds: TraitEquipmentId[];
  skillIds: EquipmentSkillId[];
};

export type EquipmentItemContent = DroppableEquippable &
  EquipmentModifiable & {
    __type: EquipmentSlot;
    id: EquipmentItemId;
  };

export type EquipmentItem = EquipmentItemContent & {
  mods: Partial<EquipmentModifiable>;
};

export type InventorySlotType = EquipmentSlot | 'skill';

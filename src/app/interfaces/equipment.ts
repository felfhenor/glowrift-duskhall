import type { DroppableEquippable } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { Branded } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';
import type { TraitEquipmentId } from '@interfaces/trait-equipment';

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
};

export type EquipmentItemContent = DroppableEquippable &
  EquipmentModifiable & {
    __type: EquipmentSlot;
    id: EquipmentItemId;

    traitIds: TraitEquipmentId[];
  };

export type EquipmentItem = EquipmentItemContent & {
  mods: Partial<EquipmentModifiable>;
};

export type InventorySlotType = EquipmentSlot | 'skill';

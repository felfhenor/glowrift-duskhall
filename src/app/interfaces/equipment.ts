import type { DroppableEquippable } from '@interfaces/droppable';
import type { Branded } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';

export type EquipmentSlot = 'accessory' | 'armor' | 'trinket' | 'weapon';

export type EquipmentItemId = Branded<string, 'EquipmentItemId'>;

export type EquipmentBlock = Record<EquipmentSlot, EquipmentItem | undefined>;

export type EquipmentModifiable = {
  baseStats: StatBlock;
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

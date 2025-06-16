import { DroppableEquippable } from './droppable';
import { Branded } from './identifiable';
import { StatBlock } from './stat';

export type EquipmentSlot = 'accessory' | 'armor' | 'trinket' | 'weapon';

export type EquipmentItemId = Branded<string, 'EquipmentItemId'>;

export type EquipmentBlock = Record<EquipmentSlot, EquipmentItem | undefined>;

export type EquipmentModifiable = {
  baseStats: StatBlock;
};

export type EquipmentItemDefinition = DroppableEquippable &
  EquipmentModifiable & {
    __type: EquipmentSlot;
    id: EquipmentItemId;
  };

export type EquipmentItem = EquipmentItemDefinition & {
  mods: Partial<EquipmentModifiable>;
};

export type InventorySlotType = EquipmentSlot | 'skill';

import type { EquipmentModifiable } from '@interfaces/content-equipment';
import type { HasRarity } from '@interfaces/droppable';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { HasDescription } from '@interfaces/traits';

export type TraitEquipmentId = Branded<string, 'TraitEquipmentId'>;

export type TraitEquipmentContent = IsContentItem &
  HasRarity &
  HasDescription &
  EquipmentModifiable & {
    __type: 'traitequipment';
    id: TraitEquipmentId;
  };

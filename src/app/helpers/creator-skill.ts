import { getEntriesByType, getEntry } from '@helpers/content';
import { droppableCleanup } from '@helpers/droppable';
import { rngChoiceRarity, rngSeeded, rngUuid } from '@helpers/rng';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillId,
} from '@interfaces';

export function skillAllDefinitions(): EquipmentSkillContent[] {
  return getEntriesByType<EquipmentSkillContent>('skill');
}

export function skillPickRandomDefinitionByRarity(
  definitions = getEntriesByType<EquipmentSkillContent>('skill'),
  rng = rngSeeded(rngUuid()),
): EquipmentSkillContent {
  const allItems = definitions.filter((i) => !i.preventDrop);

  const chosenItem = rngChoiceRarity(allItems, rng);
  if (!chosenItem) throw new Error('Could not generate a skill.');

  const chosenItemDefinition = getEntry<EquipmentSkillContent>(chosenItem.id);
  if (!chosenItemDefinition) throw new Error('Could not generate a skill.');

  return structuredClone(chosenItemDefinition);
}

export function skillCreate(def: EquipmentSkillContent): EquipmentSkill {
  const defClone = structuredClone(def);
  droppableCleanup(defClone);

  return {
    ...defClone,
    id: `${defClone.id}|${rngUuid()}` as EquipmentSkillId,
    mods: {},
  };
}

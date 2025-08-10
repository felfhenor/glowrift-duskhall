import { getEntriesByType, getEntry } from '@helpers/content';
import { cleanupDroppableDefinition } from '@helpers/droppable';
import { randomChoiceByRarity, seededrng, uuid } from '@helpers/rng';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillId,
} from '@interfaces';

export function allSkillDefinitions(): EquipmentSkillContent[] {
  return getEntriesByType<EquipmentSkillContent>('skill');
}

export function pickRandomSkillDefinitionBasedOnRarity(
  definitions = getEntriesByType<EquipmentSkillContent>('skill'),
  rng = seededrng(uuid()),
): EquipmentSkillContent {
  const allItems = definitions.filter((i) => !i.preventDrop);

  const chosenItem = randomChoiceByRarity(allItems, rng);
  if (!chosenItem) throw new Error('Could not generate a skill.');

  const chosenItemDefinition = getEntry<EquipmentSkillContent>(chosenItem.id);
  if (!chosenItemDefinition) throw new Error('Could not generate a skill.');

  return structuredClone(chosenItemDefinition);
}

export function createSkill(def: EquipmentSkillContent): EquipmentSkill {
  const defClone = structuredClone(def);
  cleanupDroppableDefinition(defClone);

  return {
    ...defClone,
    id: `${defClone.id}|${uuid()}` as EquipmentSkillId,
    mods: {},
  };
}

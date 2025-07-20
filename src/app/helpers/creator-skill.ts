import { cloneDeep } from 'lodash';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillId,
} from '@interfaces';
import { getEntriesByType, getEntry } from '@helpers/content';
import { cleanupDroppableDefinition } from '@helpers/droppable';
import { randomIdentifiableChoice, seededrng, uuid } from '@helpers/rng';

export function allSkillDefinitions(): EquipmentSkillContent[] {
  return getEntriesByType<EquipmentSkillContent>('skill');
}

export function pickRandomSkillDefinition(
  definitions = getEntriesByType<EquipmentSkillContent>('skill'),
  rng = seededrng(uuid()),
): EquipmentSkillContent {
  const allItems = definitions.filter((i) => !i.preventDrop);

  const chosenItem = randomIdentifiableChoice<EquipmentSkillContent>(
    allItems,
    rng,
  );
  if (!chosenItem) throw new Error('Could not generate a skill.');

  const chosenItemDefinition = getEntry<EquipmentSkillContent>(chosenItem);
  if (!chosenItemDefinition) throw new Error('Could not generate a skill.');

  return cloneDeep(chosenItemDefinition);
}

export function createSkill(def: EquipmentSkillContent): EquipmentSkill {
  const defClone = cloneDeep(def);
  cleanupDroppableDefinition(defClone);

  return {
    ...defClone,
    id: `${defClone.id}|${uuid()}` as EquipmentSkillId,
    mods: {},
  };
}

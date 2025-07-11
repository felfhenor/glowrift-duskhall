import { cloneDeep } from 'lodash';
import {
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillId,
} from '../interfaces';
import { getEntriesByType, getEntry } from './content';
import { cleanupDroppableDefinition } from './droppable';
import { randomIdentifiableChoice, seededrng, uuid } from './rng';

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

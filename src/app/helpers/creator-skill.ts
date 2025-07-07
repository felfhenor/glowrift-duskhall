import { cloneDeep } from 'lodash';
import {
  EquipmentSkill,
  EquipmentSkillDefinition,
  EquippableSkillId,
} from '../interfaces';
import { getEntriesByType, getEntry } from './content';
import { cleanupDroppableDefinition } from './droppable';
import { randomIdentifiableChoice, seededrng, uuid } from './rng';

export function allSkillDefinitions(): EquipmentSkillDefinition[] {
  return getEntriesByType<EquipmentSkillDefinition>('skill');
}

export function pickRandomSkillDefinition(
  definitions = getEntriesByType<EquipmentSkillDefinition>('skill'),
  rng = seededrng(uuid()),
): EquipmentSkillDefinition {
  const allItems = definitions.filter((i) => !i.preventDrop);

  const chosenItem = randomIdentifiableChoice<EquipmentSkillDefinition>(
    allItems,
    rng,
  );
  if (!chosenItem) throw new Error('Could not generate a skill.');

  const chosenItemDefinition = getEntry<EquipmentSkillDefinition>(chosenItem);
  if (!chosenItemDefinition) throw new Error('Could not generate a skill.');

  return cloneDeep(chosenItemDefinition);
}

export function createSkill(def: EquipmentSkillDefinition): EquipmentSkill {
  const defClone = cloneDeep(def);
  cleanupDroppableDefinition(defClone);

  return {
    ...defClone,
    id: `${defClone.id}|${uuid()}` as EquippableSkillId,
    mods: {},
  };
}

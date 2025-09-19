import { bundleIsUnlocked } from '@helpers/bundle';
import { getEntriesByType, getEntry } from '@helpers/content';
import { droppableCleanup } from '@helpers/droppable';
import { rngChoiceRarity, rngSeeded, rngUuid } from '@helpers/rng';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillId,
} from '@interfaces';

export function skillAllDefinitions(): EquipmentSkillContent[] {
  return getEntriesByType<EquipmentSkillContent>('skill').filter(
    (i) =>
      !i.preventDrop &&
      (!i.duskmoteBundleId || bundleIsUnlocked(i.duskmoteBundleId)),
  );
}

export function skillPickRandomDefinitionByRarity(
  definitions = skillAllDefinitions(),
  rng = rngSeeded(rngUuid()),
): EquipmentSkillContent | undefined {
  const allItems = definitions;

  const chosenItem = rngChoiceRarity(allItems, rng);
  if (!chosenItem) return undefined;

  const chosenItemDefinition = getEntry<EquipmentSkillContent>(chosenItem.id);
  if (!chosenItemDefinition) return undefined;

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

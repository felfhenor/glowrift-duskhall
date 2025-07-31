import type { Animatable } from '@interfaces/artable';
import type { DroppableEquippable } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { Branded } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';

export type EquipmentSkillTargetBehavior =
  | 'Always'
  | 'NotZeroHealth'
  | 'NotMaxHealth'
  | 'IfStatusEffect'
  | 'IfNotStatusEffect';

export type EquipmentSkillAttribute =
  | 'BypassDefense'
  | 'AllowPlink'
  | 'HealsTarget';

export type EquipmentSkillTargetType = 'Allies' | 'Enemies' | 'Self' | 'All';

export type EquipmentSkillId = Branded<string, 'EquipmentSkillId'>;

export type EquipmentSkillContentModifiable = {
  techniques: EquipmentSkillContentTechnique[];
  usesPerCombat: -1 | number;
};

export type EquipmentSkillTargetBehaviorData = {
  behavior: EquipmentSkillTargetBehavior;

  statusEffectId?: string;
};

export type EquipmentSkillTechniqueStatusEffectApplication = {
  statusEffectId: string;
  chance: number;
  duration: number;
};

export type EquipmentSkillContentTechnique = {
  targets: number;
  targetType: EquipmentSkillTargetType;
  targetBehaviors: EquipmentSkillTargetBehaviorData[];
  damageScaling: StatBlock;
  elements: GameElement[];
  attributes: EquipmentSkillAttribute[];
  statusEffects: EquipmentSkillTechniqueStatusEffectApplication[];

  combatMessage: string;
};

export type EquipmentSkillContent = DroppableEquippable &
  Animatable &
  EquipmentSkillContentModifiable & {
    __type: 'skill';
    id: EquipmentSkillId;
  };

export type EquipmentSkill = EquipmentSkillContent & {
  mods: Partial<EquipmentSkillContentModifiable>;
};

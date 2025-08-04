import type { Animatable } from '@interfaces/artable';
import type { StatusEffectId } from '@interfaces/content-statuseffect';
import type { DroppableEquippable } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { Branded } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';
import type { AcademyEnchant } from '@interfaces/town';

export type EquipmentSkillTargetBehavior =
  | 'Always'
  | 'NotZeroHealth'
  | 'NotMaxHealth'
  | 'IfStatusEffect'
  | 'IfNotStatusEffect';

export type EquipmentSkillAttribute =
  | 'BypassDefense'
  | 'DamagesTarget'
  | 'AllowPlink'
  | 'HealsTarget';

export type EquipmentSkillTargetType = 'Allies' | 'Enemies' | 'Self' | 'All';

export type EquipmentSkillId = Branded<string, 'EquipmentSkillId'>;

export type EquipmentSkillContentModifiable = {
  enchantLevel: number;
  techniques: EquipmentSkillContentTechnique[];
  usesPerCombat: -1 | number;
  numTargets: number;
  damageScaling: StatBlock;
  statusEffectDurationBoost: Record<StatusEffectId, number>;
  statusEffectChanceBoost: Record<StatusEffectId, number>;
};

export type EquipmentSkillTargetBehaviorData = {
  behavior: EquipmentSkillTargetBehavior;

  statusEffectId?: StatusEffectId;
};

export type EquipmentSkillTechniqueStatusEffectApplication = {
  statusEffectId: StatusEffectId;
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

    disableUpgrades: boolean;
    unableToUpgrade: Array<keyof AcademyEnchant>;
  };

export type EquipmentSkill = EquipmentSkillContent & {
  mods?: Partial<EquipmentSkillContentModifiable>;
};

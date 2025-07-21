import { Animatable } from '@interfaces/artable';
import { DroppableEquippable } from '@interfaces/droppable';
import { GameElement } from '@interfaces/element';
import { Branded } from '@interfaces/identifiable';
import { StatBlock } from '@interfaces/stat';

export type EquipmentSkillTargetBehavior =
  | 'Always'
  | 'NotZeroHealth'
  | 'NotMaxHealth';

export type EquipmentSkillAttribute =
  | 'BypassDefense'
  | 'AllowNegative'
  | 'AllowPlink';

export type EquipmentSkillTargetType = 'Allies' | 'Enemies' | 'Self' | 'All';

export type EquipmentSkillId = Branded<string, 'EquipmentSkillId'>;

export type EquipmentSkillContentModifiable = {
  techniques: EquipmentSkillContentTechnique[];
  usesPerCombat: -1 | number;
};

export type EquipmentSkillContentTechnique = {
  targets: number;
  targetType: EquipmentSkillTargetType;
  targetBehaviors: EquipmentSkillTargetBehavior[];
  damageScaling: StatBlock;
  elements: GameElement[];
  attributes: EquipmentSkillAttribute[];

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

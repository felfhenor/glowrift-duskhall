import { Animatable } from './artable';
import { DroppableEquippable } from './droppable';
import { GameElement } from './element';
import { Branded } from './identifiable';
import { StatBlock } from './stat';

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

export type EquipmentSkillContentTechniqueModifiable = {
  techniques: EquipmentSkillContentTechnique[];
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
  EquipmentSkillContentTechniqueModifiable & {
    __type: 'skill';
    id: EquipmentSkillId;
  };

export type EquipmentSkill = EquipmentSkillContent & {
  mods: Partial<EquipmentSkillContentTechniqueModifiable>;
};

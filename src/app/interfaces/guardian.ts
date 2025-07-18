import { Animatable } from '@interfaces/artable';
import { CombatantTargettingType } from '@interfaces/combat';
import { ElementBlock } from '@interfaces/element';
import { Branded, Content } from '@interfaces/identifiable';
import { EquipmentSkillId } from '@interfaces/skill';
import { StatBlock } from '@interfaces/stat';
import { TalentId } from '@interfaces/talent';

export type GuardianId = Branded<string, 'GuardianId'>;

export type GuardianContent = Animatable &
  Content & {
    id: GuardianId;

    statScaling: StatBlock;
    skillIds: EquipmentSkillId[];

    resistance: ElementBlock;
    affinity: ElementBlock;

    talentIds: Record<TalentId, number>;

    targettingType: CombatantTargettingType;
  };

export type Guardian = GuardianContent & {
  hp: number;
  stats: StatBlock;
};

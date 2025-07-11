import { Animatable } from './artable';
import { ElementBlock } from './element';
import { Branded, Content } from './identifiable';
import { EquipmentSkillId } from './skill';
import { StatBlock } from './stat';
import { TalentId } from './talent';

export type GuardianId = Branded<string, 'GuardianId'>;

export type GuardianContent = Animatable &
  Content & {
    id: GuardianId;

    statScaling: StatBlock;
    skillIds: EquipmentSkillId[];

    resistance: ElementBlock;
    affinity: ElementBlock;

    talentIds: Record<TalentId, number>;
  };

export type Guardian = GuardianContent & {
  hp: number;
  stats: StatBlock;
};

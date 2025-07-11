import { Animatable } from './artable';
import { ElementBlock } from './element';
import { Branded, Content } from './identifiable';
import { EquippableSkillId } from './skill';
import { StatBlock } from './stat';
import { TalentId } from './talent';

export type GuardianId = Branded<string, 'GuardianId'>;

export type GuardianData = Animatable &
  Content & {
    id: GuardianId;

    statScaling: StatBlock;
    skillIds: EquippableSkillId[];

    resistance: ElementBlock;
    affinity: ElementBlock;

    talentIds: Record<TalentId, number>;
  };

export type Guardian = GuardianData & {
  hp: number;
  stats: StatBlock;
};

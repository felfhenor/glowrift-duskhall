import type { Animatable } from '@interfaces/artable';
import type { CombatantTargettingType } from '@interfaces/combat';
import type { ElementBlock } from '@interfaces/element';
import type { Branded, Content } from '@interfaces/identifiable';
import type { EquipmentSkillId } from '@interfaces/skill';
import type { StatBlock } from '@interfaces/stat';
import type { TalentId } from '@interfaces/talent';

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

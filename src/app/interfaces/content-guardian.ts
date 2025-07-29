import type { Animatable } from '@interfaces/artable';
import type { CombatantTargettingType } from '@interfaces/combat';
import type { EquipmentSkillId } from '@interfaces/content-skill';
import type { TalentId } from '@interfaces/content-talent';
import type { ElementBlock } from '@interfaces/element';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';

export type GuardianId = Branded<string, 'GuardianId'>;

export type GuardianContent = Animatable &
  IsContentItem & {
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

import type { Animatable } from '@interfaces/artable';
import type {
  CombatantCombatStats,
  CombatantTargettingType,
} from '@interfaces/combat';
import type { EquipmentSkillId } from '@interfaces/content-skill';
import type { TalentBoost } from '@interfaces/content-talent';
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

    talents: TalentBoost[];

    targettingType: CombatantTargettingType;

    combatStats: CombatantCombatStats;
  };

export type Guardian = GuardianContent & {
  hp: number;
  stats: StatBlock;
};

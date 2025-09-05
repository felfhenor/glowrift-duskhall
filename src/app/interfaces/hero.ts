import type { Animatable } from '@interfaces/artable';
import type { CombatantTargettingType } from '@interfaces/combat';
import type { EquipmentBlock } from '@interfaces/content-equipment';
import type { JobId } from '@interfaces/content-job';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { Branded, Identifiable } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';

export type HeroId = Branded<string, 'HeroId'>;

export type HeroRiskTolerance = 'low' | 'medium' | 'high';

export type Hero = Identifiable &
  Animatable & {
    id: HeroId;

    jobId: JobId;

    level: number;
    xp: number;
    hp: number;

    baseStats: StatBlock;
    totalStats: StatBlock;

    equipment: EquipmentBlock;
    skills: (EquipmentSkill | undefined)[];
    talents: Record<string, number>;

    targettingType: CombatantTargettingType;
  };

import { Animatable } from '@interfaces/artable';
import { EquipmentBlock } from '@interfaces/equipment';
import { Branded, Identifiable } from '@interfaces/identifiable';
import { EquipmentSkill } from '@interfaces/skill';
import { StatBlock } from '@interfaces/stat';

export type HeroId = Branded<string, 'HeroId'>;

export type HeroRiskTolerance = 'low' | 'medium' | 'high';

export type Hero = Identifiable &
  Animatable & {
    id: HeroId;

    level: number;
    xp: number;
    hp: number;

    baseStats: StatBlock;
    totalStats: StatBlock;

    equipment: EquipmentBlock;
    skills: (EquipmentSkill | undefined)[];
    talents: Record<string, number>;
  };

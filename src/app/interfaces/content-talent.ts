import type { Artable } from '@interfaces/artable';
import type { CombatantCombatStats } from '@interfaces/combat';
import type {
  EquipmentSkillAttribute,
  EquipmentSkillTechniqueStatusEffectApplication,
} from '@interfaces/content-skill';
import type { GameElement } from '@interfaces/element';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';
import type { HasDescription } from '@interfaces/traits';

export type TalentId = Branded<string, 'TalentId'>;

export type TalentContent = IsContentItem &
  Artable &
  HasDescription & {
    id: TalentId;

    requireTalentId?: string;

    applyToAllSkills: boolean;
    applyToElements: GameElement[];
    applyToSkillIds: string[];
    applyToStatusEffectIds: string[];
    applyToAttributes: EquipmentSkillAttribute[];

    boostStats: StatBlock;

    boostedStatusEffectChance: number;
    boostedStatusEffectDuration: number;
    boostStatusEffectStats: StatBlock;

    additionalTargets: number;

    chanceToIgnoreConsume: number;

    applyStatusEffects: EquipmentSkillTechniqueStatusEffectApplication[];

    combatStats: CombatantCombatStats;
  };

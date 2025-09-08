import type { Artable } from '@interfaces/artable';
import type { CombatantCombatStats } from '@interfaces/combat';
import type {
  EquipmentSkillAttribute,
  EquipmentSkillContentTechnique,
  EquipmentSkillTechniqueStatusEffectApplication,
} from '@interfaces/content-skill';
import type { GameElement } from '@interfaces/element';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';
import type { HasDescription } from '@interfaces/traits';

export type TalentId = Branded<string, 'TalentId'>;

export type TalentBoost = { talentId: TalentId; value: number };

export type TalentTownStats = {
  merchantFindItemBonus: number;
  marketTradeBonusPercent: number;
  breakdownCurrencyBonus: number;
  healOverTimeBonus: number;
};

export type TalentContent = IsContentItem &
  Artable &
  HasDescription & {
    id: TalentId;

    requireTalentId?: TalentId;

    applyToAllSkills: boolean;
    applyToAllStatusEffects: boolean;
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
    addTechniques: EquipmentSkillContentTechnique[];

    townStats: TalentTownStats;
  };

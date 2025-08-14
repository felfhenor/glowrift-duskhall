import type { CurrencyBlock } from '@interfaces/content-currency';
import type { StatusEffectId } from '@interfaces/content-statuseffect';
import type { TalentId } from '@interfaces/content-talent';
import type { HasRarity } from '@interfaces/droppable';
import type { ElementBlock } from '@interfaces/element';
import type { StatBlock } from '@interfaces/stat';
import type { HasDescription } from '@interfaces/traits';

export type TownBuilding =
  | 'Market'
  | 'Merchant'
  | 'Blacksmith'
  | 'Academy'
  | 'Alchemist'
  | 'Salvager'
  | 'Rally Point';

export type ItemAction = 'Salvage' | 'Equip';

export type SkillAction = 'Salvage' | 'Equip';

export type BlacksmithEnchant = HasRarity &
  HasDescription & {
    cost: CurrencyBlock;

    statBoosts?: StatBlock;
    elementBoosts?: ElementBlock;
    talentBoosts?: TalentId[];
  };

export type AcademyEnchant = HasRarity &
  HasDescription & {
    cost: CurrencyBlock;

    usesPerCombat?: number;
    numTargets?: number;
    damageScaling?: StatBlock;
    statusEffectDurationBoost?: Record<StatusEffectId, number>;
    statusEffectChanceBoost?: Record<StatusEffectId, number>;
  };

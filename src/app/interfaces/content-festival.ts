import type { GameCurrency } from '@interfaces/content-currency';
import type { HasRarity } from '@interfaces/droppable';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { HasDescription } from '@interfaces/traits';

export type FestivalId = Branded<string, 'FestivalId'>;

export type FestivalEffectCombatAttribute = 'damage';

export type FestivalEffectsCombat = {
  outgoing?: Partial<Record<FestivalEffectCombatAttribute, number>>;
  incoming?: Partial<Record<FestivalEffectCombatAttribute, number>>;
};

export type FestivalEffectsProduction = Partial<Record<GameCurrency, number>>;

export type FestivalEffectsExploration = {
  ticks?: number;
};

export type FestivalEffects = {
  combat?: FestivalEffectsCombat;
  production?: FestivalEffectsProduction;
  exploration?: FestivalEffectsExploration;
};

export type FestivalContent = HasRarity &
  IsContentItem &
  HasDescription & {
    id: FestivalId;
    endDescription: string;
    effectsDescription: string;
    duration: number;
    effects: FestivalEffects;
  };

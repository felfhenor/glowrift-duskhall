import type { GameCurrency } from '@interfaces/content-currency';
import type { HasRarity } from '@interfaces/droppable';
import type { Branded, IsContentItem } from '@interfaces/identifiable';

export type FestivalId = Branded<string, 'FestivalId'>;

export type FestivalEffectCombatAttribute = 'damage';

export interface FestivalEffectsCombat {
  outgoing?: Partial<Record<FestivalEffectCombatAttribute, number>>;
  incoming?: Partial<Record<FestivalEffectCombatAttribute, number>>;
}

export type FestivalEffectsProduction = Partial<Record<GameCurrency, number>>;

export interface FestivalEffectsExploration {
  ticks?: number;
}

export interface FestivalEffects {
  combat?: FestivalEffectsCombat;
  production?: FestivalEffectsProduction;
  exploration?: FestivalEffectsExploration;
}

export type FestivalContent = HasRarity &
  IsContentItem & {
    id: FestivalId;
    description: string;
    endDescription: string;
    effectsDescription: string;
    duration: number;
    effects: FestivalEffects;
  };

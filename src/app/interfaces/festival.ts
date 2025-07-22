import type { GameCurrency } from '@interfaces/currency';
import type { HasRarity } from '@interfaces/droppable';
import type { Content } from '@interfaces/identifiable';

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
  Content & {
    description: string;
    endDescription: string;
    effectsDescription: string;
    duration: number;
    effects: FestivalEffects;
  };

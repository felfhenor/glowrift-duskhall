import { GameCurrency } from './currency';
import { DropRarity } from './droppable';
import { Content } from './identifiable';

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

export interface Festival extends Content {
  description: string;
  endDescription: string;
  effectsDescription: string;
  duration: number;
  rarity: DropRarity;
  effects: FestivalEffects;
}

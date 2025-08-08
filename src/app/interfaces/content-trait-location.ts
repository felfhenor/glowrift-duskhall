import type { CurrencyId } from '@interfaces/content-currency';
import type { HasRarity } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { HasDescription } from '@interfaces/traits';

export type TraitLocationId = Branded<string, 'TraitLocationId'>;

export type TraitLocationContent = IsContentItem &
  HasRarity &
  HasDescription & {
    __type: 'traitlocation';
    id: TraitLocationId;

    effects: TraitLocationEffects;
  };

export interface TraitLocationEffectsExploration {
  travelTimePercent?: number;
}

export interface TraitLocationEffectsWorldGen {
  encounterLevelModifier?: number;
  guardianCountModifier?: number;
  lootCountModifier?: number;
}

export interface TraitLocationEffectsCurrencyValue {
  currencyId: CurrencyId;
  value: number;
}

export interface TraitLocationEffectsCurrency {
  generate?: TraitLocationEffectsCurrencyValue[];
  special?: TraitLocationEffectsCurrencyValue[];
}

export interface TraitLocationEffectsCombat {
  damage: Record<'all', Array<{ element: GameElement; multiplier: number }>>;
}

export interface TraitLocationEffects {
  combat?: TraitLocationEffectsCombat;
  currency?: TraitLocationEffectsCurrency;
  worldgen?: TraitLocationEffectsWorldGen;
  exploration?: TraitLocationEffectsExploration;
}

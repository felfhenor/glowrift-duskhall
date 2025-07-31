import { getEntry } from '@helpers/content';
import { locationTraits } from '@helpers/trait-location';
import type {
  CurrencyContent,
  GameCurrency,
} from '@interfaces/content-currency';
import type { TraitLocationEffectsCurrencyValue } from '@interfaces/content-trait-location';
import type { WorldLocation } from '@interfaces/world';
import { sum } from 'es-toolkit/compat';

export function locationTraitCurrencySpecialModifier(
  location: WorldLocation,
  currency: GameCurrency,
): number {
  const currencyBoosts = locationTraits(location)
    .flatMap((loc) => loc.effects.currency?.special ?? [])
    .filter(
      (curr) => getEntry<CurrencyContent>(curr.currencyId)?.name === currency,
    )
    .map((curr) => curr.value);

  return sum(currencyBoosts);
}

export function locationTraitCurrencyGenerateModifier(
  location: WorldLocation,
  currency: GameCurrency,
): number {
  const currencyBoosts = locationTraits(location)
    .flatMap((loc) => loc.effects.currency?.generate ?? [])
    .filter(
      (curr) => getEntry<CurrencyContent>(curr.currencyId)?.name === currency,
    )
    .map((curr) => curr.value);

  return sum(currencyBoosts);
}

export function locationTraitCurrencyAllGenerateModifiers(
  location: WorldLocation,
): TraitLocationEffectsCurrencyValue[] {
  const currencyBoosts = locationTraits(location).flatMap(
    (loc) => loc.effects.currency?.generate ?? [],
  );

  return currencyBoosts;
}

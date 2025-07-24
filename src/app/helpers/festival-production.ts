import { getActiveFestivals } from '@helpers/festival';
import type { GameCurrency } from '@interfaces';
import { sum } from 'es-toolkit/compat';

export function getFestivalProductionMultiplier(
  currency: GameCurrency,
): number {
  return sum(
    getActiveFestivals().map((f) => f?.effects?.production?.[currency] ?? 0),
  );
}

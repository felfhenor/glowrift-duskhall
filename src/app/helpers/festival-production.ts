import { sum } from 'lodash';
import type { GameCurrency } from '@interfaces';
import { getActiveFestivals } from '@helpers/festival';

export function getFestivalProductionMultiplier(
  currency: GameCurrency,
): number {
  return sum(
    getActiveFestivals().map((f) => f?.effects?.production?.[currency] ?? 0),
  );
}

import { sum } from 'lodash';
import { GameCurrency } from '../interfaces';
import { getActiveFestivals } from './festival';

export function getFestivalProductionMultiplier(
  currency: GameCurrency,
): number {
  return sum(
    getActiveFestivals().map((f) => f?.effects?.production?.[currency] ?? 0),
  );
}

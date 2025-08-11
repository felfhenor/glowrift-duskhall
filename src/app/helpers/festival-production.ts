import { festivalGetActive } from '@helpers/festival';
import type { GameCurrency } from '@interfaces';
import { sum } from 'es-toolkit/compat';

export function festivalProductionMultiplier(currency: GameCurrency): number {
  return sum(
    festivalGetActive().map((f) => f?.effects?.production?.[currency] ?? 0),
  );
}

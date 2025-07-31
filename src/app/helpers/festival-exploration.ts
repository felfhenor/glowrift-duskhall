import { getActiveFestivals } from '@helpers/festival';
import { sum } from 'es-toolkit/compat';

export function getFestivalExplorationTickMultiplier(): number {
  return sum(
    getActiveFestivals().map((f) => f?.effects?.exploration?.ticks ?? 0),
  );
}

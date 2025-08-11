import { festivalGetActive } from '@helpers/festival';
import { sum } from 'es-toolkit/compat';

export function festivalExplorationTickMultiplier(): number {
  return sum(
    festivalGetActive().map((f) => f?.effects?.exploration?.ticks ?? 0),
  );
}

import { clockGetTickTimer, clockIsTimerExpired } from '@helpers/clock';
import { getEntriesByType, getEntry } from '@helpers/content';
import { notify } from '@helpers/notify';
import { rngChoiceRarity, rngSucceedsChance } from '@helpers/rng';
import { gamestate, updateGamestate } from '@helpers/state-game';
import type { FestivalContent } from '@interfaces';

export function festivalGetActive(): FestivalContent[] {
  return Object.keys(gamestate().festival.festivals)
    .map((f) => getEntry<FestivalContent>(f)!)
    .filter(Boolean);
}

export function festivalIsActive(festivalId: string): boolean {
  return !!gamestate().festival.festivals[festivalId];
}

export function festivalStart(festivalId: string): void {
  const festivalData = getEntry<FestivalContent>(festivalId);
  if (!festivalData) return;

  notify(festivalData.description, 'Festival');

  updateGamestate((state) => {
    state.festival.festivals[festivalId] = clockGetTickTimer(
      festivalData.duration,
    );
    state.festival.ticksWithoutFestivalStart = 0;
    return state;
  });
}

export function festivalStop(festivalId: string): void {
  const festivalData = getEntry<FestivalContent>(festivalId);
  if (!festivalData) return;

  notify(festivalData.endDescription, 'Festival');

  updateGamestate((state) => {
    delete state.festival.festivals[festivalId];
    return state;
  });
}

export function festivalCheckExpirations(): void {
  const activeFestivals = gamestate().festival.festivals;
  const expiredFestivals = Object.keys(activeFestivals).filter((fest) =>
    clockIsTimerExpired(activeFestivals[fest]),
  );
  expiredFestivals.forEach((festivalId) => {
    festivalStop(festivalId);
  });
}

export function festivalPickRandomByRarity(): string | undefined {
  const festivals = getEntriesByType<FestivalContent>('festival').filter(
    (f) => !festivalIsActive(f.id),
  );

  return rngChoiceRarity(festivals)?.id;
}

export function festivalMaybeStartNew(): void {
  const ticksSinceLastFestival = gamestate().festival.ticksWithoutFestivalStart;
  const adjustedTicks = Math.floor(ticksSinceLastFestival / 1000);
  const shouldStartFestival = rngSucceedsChance(adjustedTicks);

  if (shouldStartFestival) {
    const randomFestival = festivalPickRandomByRarity();
    if (!randomFestival) return;

    festivalStart(randomFestival);
  }
}

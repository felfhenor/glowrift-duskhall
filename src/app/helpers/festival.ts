import { getTickTimer, isExpired } from '@helpers/clock';
import { getEntriesByType, getEntry } from '@helpers/content';
import { notify } from '@helpers/notify';
import { randomChoiceByRarity, succeedsChance } from '@helpers/rng';
import { gamestate, updateGamestate } from '@helpers/state-game';
import type { FestivalContent } from '@interfaces';

export function getActiveFestivals(): FestivalContent[] {
  return Object.keys(gamestate().festival.festivals)
    .map((f) => getEntry<FestivalContent>(f)!)
    .filter(Boolean);
}

export function isFestivalActive(festivalId: string): boolean {
  return !!gamestate().festival.festivals[festivalId];
}

export function startFestival(festivalId: string): void {
  const festivalData = getEntry<FestivalContent>(festivalId);
  if (!festivalData) return;

  notify(festivalData.description, 'Festival');

  updateGamestate((state) => {
    state.festival.festivals[festivalId] = getTickTimer(festivalData.duration);
    state.festival.ticksWithoutFestivalStart = 0;
    return state;
  });
}

export function stopFestival(festivalId: string): void {
  const festivalData = getEntry<FestivalContent>(festivalId);
  if (!festivalData) return;

  notify(festivalData.endDescription, 'Festival');

  updateGamestate((state) => {
    delete state.festival.festivals[festivalId];
    return state;
  });
}

export function checkFestivalExpirations(): void {
  const activeFestivals = gamestate().festival.festivals;
  const expiredFestivals = Object.keys(activeFestivals).filter((fest) =>
    isExpired(activeFestivals[fest]),
  );
  expiredFestivals.forEach((festivalId) => {
    stopFestival(festivalId);
  });
}

export function pickRandomFestivalBasedOnRarity(): string | undefined {
  const festivals = getEntriesByType<FestivalContent>('festival').filter(
    (f) => !isFestivalActive(f.id),
  );

  return randomChoiceByRarity(festivals)?.id;
}

export function maybeStartNewFestival(): void {
  const ticksSinceLastFestival = gamestate().festival.ticksWithoutFestivalStart;
  const adjustedTicks = Math.floor(ticksSinceLastFestival / 1000);
  const shouldStartFestival = succeedsChance(adjustedTicks);

  if (shouldStartFestival) {
    const randomFestival = pickRandomFestivalBasedOnRarity();
    if (!randomFestival) return;

    startFestival(randomFestival);
  }
}

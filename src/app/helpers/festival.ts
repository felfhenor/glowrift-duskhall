import { shuffle, sumBy } from 'lodash';
import { DropRarity, FestivalContent } from '@interfaces';
import { getTickTimer, isExpired } from '@helpers/clock';
import { getEntriesByType, getEntry } from '@helpers/content';
import { notify } from '@helpers/notify';
import { randomNumber, succeedsChance } from '@helpers/rng';
import { gamestate, updateGamestate } from '@helpers/state-game';

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

  const festivalRarities: Record<DropRarity, number> = {
    Common: 100,
    Uncommon: 25,
    Rare: 10,
    Mystical: 5,
    Legendary: 2,
    Unique: 1,
  };

  const totalRarity = sumBy(festivals, (f) => festivalRarities[f.rarity]);
  const festivalOrdering = shuffle(festivals);

  const randomValue = randomNumber(totalRarity);
  let cumulativeRarity = 0;

  for (const festival of festivalOrdering) {
    cumulativeRarity += festivalRarities[festival.rarity];
    if (randomValue < cumulativeRarity) {
      return festival.id;
    }
  }

  return undefined;
}

export function maybeStartNewFestival(): void {
  const ticksSinceLastFestival = gamestate().festival.ticksWithoutFestivalStart;
  const adjustedTicks = Math.floor(ticksSinceLastFestival / 100);
  const shouldStartFestival = succeedsChance(adjustedTicks);

  if (shouldStartFestival) {
    const randomFestival = pickRandomFestivalBasedOnRarity();
    if (!randomFestival) return;

    startFestival(randomFestival);
  }
}

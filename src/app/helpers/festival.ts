import { shuffle, sum, sumBy } from 'lodash';
import {
  DropRarity,
  Festival,
  FestivalEffectCombatAttribute,
  GameCurrency,
} from '../interfaces';
import { getTickTimer, isExpired } from './clock';
import { getEntriesByType, getEntry } from './content';
import { randomNumber } from './rng';
import { gamestate, updateGamestate } from './state-game';

export function getActiveFestivals(): Festival[] {
  return Object.keys(gamestate().festival.festivals)
    .map((f) => getEntry<Festival>(f)!)
    .filter(Boolean);
}

export function isFestivalActive(festivalId: string): boolean {
  return !!gamestate().festival.festivals[festivalId];
}

export function startFestival(festivalId: string): void {
  const festivalData = getEntry<Festival>(festivalId);
  if (!festivalData) return;

  updateGamestate((state) => {
    state.festival.festivals[festivalId] = getTickTimer(festivalData.duration);
    return state;
  });
}

export function stopFestival(festivalId: string): void {
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
  const festivals = getEntriesByType<Festival>('festival').filter(
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

export function maybeStartNewFestival(): void {}

export function getFestivalProductionMultiplier(
  currency: GameCurrency,
): number {
  return sum(
    getActiveFestivals().map((f) => f?.effects?.production?.[currency] ?? 0),
  );
}

export function getExplorationTickMultiplier(): number {
  return sum(
    getActiveFestivals().map((f) => f?.effects?.exploration?.ticks ?? 0),
  );
}

export function getCombatOutgoingAttributeMultiplier(
  attribute: FestivalEffectCombatAttribute,
): number {
  return sum(
    getActiveFestivals().map(
      (f) => f?.effects?.combat?.outgoing?.[attribute] ?? 0,
    ),
  );
}

export function getCombatIncomingAttributeMultiplier(
  attribute: FestivalEffectCombatAttribute,
): number {
  return sum(
    getActiveFestivals().map(
      (f) => f?.effects?.combat?.incoming?.[attribute] ?? 0,
    ),
  );
}

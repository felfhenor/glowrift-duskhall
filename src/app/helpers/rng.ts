import { myGameId } from '@helpers/state-game';
import type { DropRarity, HasRarity, Identifiable } from '@interfaces';
import { pull, sumBy } from 'es-toolkit/compat';
import seedrandom, { type PRNG } from 'seedrandom';
import { v4 as uuid4 } from 'uuid';

export function rngUuid(): string {
  return uuid4();
}

export function rngRandom(): PRNG {
  return rngSeeded(rngUuid());
}

export function rngSeeded(seed = rngUuid()): PRNG {
  return seedrandom(seed);
}

export function rngGame(): PRNG {
  return rngSeeded(myGameId());
}

export function rngChoice<T>(choices: T[], rng = rngSeeded(rngUuid())): T {
  return choices[Math.floor(rng() * choices.length)];
}

export function rngShuffle<T>(choices: T[], rng = rngSeeded(rngUuid())): T[] {
  const baseArray = choices.slice();

  const shuffled = [];

  for (let i = 0; i < choices.length; i++) {
    const chosen = rngChoice(baseArray, rng);
    shuffled.push(chosen);
    pull(baseArray, chosen);
  }

  return shuffled;
}

export function rngChoiceIdentifiable<T extends Identifiable>(
  choices: T[],
  rng = rngSeeded(rngUuid()),
): string {
  return choices[Math.floor(rng() * choices.length)].id;
}

export function rngNumber(max: number, rng = rngSeeded(rngUuid())): number {
  return Math.floor(rng() * max);
}

export function rngNumberRange(
  min: number,
  max: number,
  rng = rngSeeded(rngUuid()),
): number {
  return Math.floor(min + rng() * (max - min));
}

export function rngSucceedsChance(
  max: number,
  rng = rngSeeded(rngUuid()),
): boolean {
  return rng() * 100 <= max;
}

export function rngChoiceRarity<T extends HasRarity>(
  items: T[],
  rng = rngSeeded(rngUuid()),
): T | undefined {
  const rarityWeights: Record<DropRarity, number> = {
    Common: 25,
    Uncommon: 15,
    Rare: 5,
    Mystical: 3,
    Legendary: 2,
    Unique: 1,
  };

  const totalRarity = sumBy(items, (f) => rarityWeights[f.rarity]);
  const itemOrdering = rngShuffle(items, rng);

  const randomValue = rngNumber(totalRarity, rng);
  let cumulativeRarity = 0;

  for (const item of itemOrdering) {
    cumulativeRarity += rarityWeights[item.rarity];
    if (randomValue < cumulativeRarity) {
      return item;
    }
  }

  return undefined;
}

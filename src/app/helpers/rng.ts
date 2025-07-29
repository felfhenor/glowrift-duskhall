import { myGameId } from '@helpers/state-game';
import type { DropRarity, HasRarity, Identifiable } from '@interfaces';
import { pull, sumBy } from 'es-toolkit/compat';
import seedrandom, { type PRNG } from 'seedrandom';
import { v4 as uuid4 } from 'uuid';

export function uuid(): string {
  return uuid4();
}

export function randomrng(): PRNG {
  return seededrng(uuid());
}

export function seededrng(seed = uuid()): PRNG {
  return seedrandom(seed);
}

export function gamerng(): PRNG {
  return seededrng(myGameId());
}

export function randomChoice<T>(choices: T[], rng = seededrng(uuid())): T {
  return choices[Math.floor(rng() * choices.length)];
}

export function shufflerng<T>(choices: T[], rng = seededrng(uuid())): T[] {
  const baseArray = choices.slice();

  const shuffled = [];

  for (let i = 0; i < choices.length; i++) {
    const chosen = randomChoice(baseArray, rng);
    shuffled.push(chosen);
    pull(baseArray, chosen);
  }

  return shuffled;
}

export function randomIdentifiableChoice<T extends Identifiable>(
  choices: T[],
  rng = seededrng(uuid()),
): string {
  return choices[Math.floor(rng() * choices.length)].id;
}

export function randomNumber(max: number, rng = seededrng(uuid())): number {
  return Math.floor(rng() * max);
}

export function randomNumberRange(
  min: number,
  max: number,
  rng = seededrng(uuid()),
): number {
  return Math.floor(min + rng() * (max - min));
}

export function succeedsChance(max: number, rng = seededrng(uuid())): boolean {
  return rng() * 100 <= max;
}

export function randomChoiceByRarity<T extends HasRarity>(
  items: T[],
  rng = seededrng(uuid()),
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
  const itemOrdering = shufflerng(items, rng);

  const randomValue = randomNumber(totalRarity, rng);
  let cumulativeRarity = 0;

  for (const item of itemOrdering) {
    cumulativeRarity += rarityWeights[item.rarity];
    if (randomValue < cumulativeRarity) {
      return item;
    }
  }

  return undefined;
}

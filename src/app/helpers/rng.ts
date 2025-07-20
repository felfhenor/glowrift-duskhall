import { myGameId } from '@helpers/state-game';
import type { Identifiable } from '@interfaces';
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

export function randomChoice<T>(choices: T[], rng = seededrng(uuid())): T {
  // throw away the first 2 rng values. who needs 'em anyway?
  rng();
  rng();

  return choices[Math.floor(rng() * choices.length)];
}

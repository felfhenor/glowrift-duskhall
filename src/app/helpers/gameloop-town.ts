import { townMerchantGameloop } from './gameloop-town-merchant';
import { allHeroes } from './hero';
import { heroGainXp } from './hero-xp';
import { getCurrentWorldNode } from './world';

export function townGameloop(numTicks: number): void {
  townMerchantGameloop(numTicks);

  const currentNode = getCurrentWorldNode();
  if (currentNode?.nodeType !== 'town') return;

  allHeroes().forEach((hero) => {
    heroGainXp(hero, numTicks);
  });
}

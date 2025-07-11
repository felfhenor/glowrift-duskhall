import { townMerchantGameloop } from '@helpers/gameloop-town-merchant';
import { allHeroes } from '@helpers/hero';
import { heroGainXp } from '@helpers/hero-xp';
import { getCurrentWorldNode } from '@helpers/world';

export function townGameloop(numTicks: number): void {
  townMerchantGameloop(numTicks);

  const currentNode = getCurrentWorldNode();
  if (currentNode?.nodeType !== 'town') return;

  allHeroes().forEach((hero) => {
    heroGainXp(hero, numTicks);
  });
}

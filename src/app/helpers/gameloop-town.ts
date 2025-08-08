import { townMerchantGameloop } from '@helpers/gameloop-town-merchant';
import { allHeroesHeal } from '@helpers/hero';
import { allHeroesGainXp } from '@helpers/hero-xp';
import { getCurrentWorldNode } from '@helpers/world';

export function townGameloop(numTicks: number): void {
  townMerchantGameloop(numTicks);

  const currentNode = getCurrentWorldNode();
  if (currentNode?.nodeType !== 'town') return;

  allHeroesGainXp(numTicks);
  allHeroesHeal(numTicks);
}

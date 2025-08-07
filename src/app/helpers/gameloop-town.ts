import { townMerchantGameloop } from '@helpers/gameloop-town-merchant';
import { allHeroes, healHero } from '@helpers/hero';
import { heroGainXp } from '@helpers/hero-xp';
import { getCurrentWorldNode } from '@helpers/world';

export function townGameloop(numTicks: number): void {
  townMerchantGameloop(numTicks);

  const currentNode = getCurrentWorldNode();
  if (currentNode?.nodeType !== 'town') return;

  allHeroes().forEach((hero) => {
    heroGainXp(hero, numTicks);
    
    // Heal heroes over time in town (1 HP per tick)
    if (hero.hp < hero.totalStats.Health) {
      healHero(hero.id, numTicks);
    }
  });
}

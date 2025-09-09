import { heroHealAll } from '@helpers/hero';
import { heroAllGainXp } from '@helpers/hero-xp';
import { updateGamestate } from '@helpers/state-game';
import { locationGetCurrent } from '@helpers/world-location';

export function gameloopTown(): void {
  const currentNode = locationGetCurrent();
  if (currentNode?.nodeType !== 'town') return;
  if (!currentNode.currentlyClaimed) return;

  heroAllGainXp(1);
  heroHealAll(1);

  updateGamestate((state) => {
    state.hero.exploreTicks = 0;
    return state;
  });
}

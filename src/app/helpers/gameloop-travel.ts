import { notify } from '@helpers/notify';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { isTraveling } from '@helpers/travel';
import { globalStatusText } from '@helpers/ui';
import { locationGet, locationGetCurrent } from '@helpers/world-location';

export function gameloopTravel(numTicks: number): void {
  if (!isTraveling()) return;

  const travel = gamestate().hero.travel;

  let didFinishTravel = false;

  updateGamestate((state) => {
    state.hero.travel.ticksLeft -= numTicks;
    if (state.hero.travel.ticksLeft > 0) return state;

    state.hero.position.nodeId = travel.nodeId;
    state.hero.position.x = travel.x;
    state.hero.position.y = travel.y;

    state.hero.travel.nodeId = '';
    state.hero.travel.ticksLeft = 0;
    state.hero.travel.x = 0;
    state.hero.travel.y = 0;

    didFinishTravel = true;

    return state;
  });

  const travelingToNode = locationGet(travel.x, travel.y);
  if (travelingToNode) {
    globalStatusText.set(
      `Traveling to ${travelingToNode.name || 'new destination'}... ${
        travel.ticksLeft
      } ticks left.`,
    );
  }

  if (didFinishTravel) {
    const newNode = locationGetCurrent();

    notify(`Arrived at ${newNode?.name ?? 'destination'}!`, 'Travel');
    updateGamestate((state) => {
      const exploreTicks = newNode?.currentlyClaimed
        ? 0
        : ((newNode?.encounterLevel ?? 1) + 1) * 5;
      state.hero.location.ticksTotal = exploreTicks;
      state.hero.location.ticksLeft = exploreTicks;
      return state;
    });
  }
}

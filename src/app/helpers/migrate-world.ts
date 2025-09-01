import { defaultNodeCountBlock } from '@helpers/defaults';
import { updateGamestate } from '@helpers/state-game';
import { timerTicksElapsed } from '@helpers/timer';
import {
  locationGetClaimed,
  locationIsPermanentlyClaimed,
  locationUnclaim,
} from '@helpers/world-location';

export function migrateUnclaimMissedNodes(): void {
  locationGetClaimed().forEach((claimed) => {
    if (
      locationIsPermanentlyClaimed(claimed) ||
      claimed.unclaimTime > timerTicksElapsed()
    )
      return;

    locationUnclaim(claimed);
  });
}

export function migratePermanentlyClaimedNodes(): void {
  locationGetClaimed().forEach((claimed) => {
    if (claimed.unclaimTime > 0) return;
    claimed.permanentlyClaimed = true;
  });
}

export function migrateResetClaimedNodeCounts(): void {
  const baseNodeCount = defaultNodeCountBlock();
  locationGetClaimed().forEach((node) => baseNodeCount[node.nodeType!]++);

  updateGamestate((state) => {
    state.world.claimedCounts = baseNodeCount;
    return state;
  });
}

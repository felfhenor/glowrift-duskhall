import { gamestate, updateGamestate } from '@helpers/state-game';

export function victoryHasWonForFirstTime(): boolean {
  const { hasDismissedWinNotification, hasWon } = gamestate().meta;
  return hasWon && hasDismissedWinNotification;
}

export function victoryDismissWinDialog(): void {
  updateGamestate((state) => {
    state.meta.hasDismissedWinNotification = true;
    return state;
  });
}

export function victoryClaim(): void {
  updateGamestate((state) => {
    state.meta.hasWon = true;
    state.meta.wonAtTick = state.actionClock.numTicks;
    return state;
  });
}

import { rngUuid } from '@helpers/rng';
import { localStorageSignal } from '@helpers/signal';
import type { Combat, CombatLog, Combatant } from '@interfaces';
import mustache from 'mustache';

export const combatLog = localStorageSignal<CombatLog[]>('combatLog', []);

let pendingCombatLogMessages: CombatLog[] = [];

export function beginCombatLogCommits() {
  pendingCombatLogMessages = [];
}

export function endCombatLogCommits() {
  combatLog.update((logs) =>
    [...pendingCombatLogMessages, ...logs].slice(0, 500),
  );

  pendingCombatLogMessages = [];
}

export function combatFormatMessage(template: string, props: unknown): string {
  return mustache.render(template, props);
}

export function combatMessageLog(
  combat: Combat,
  message: string,
  actor?: Combatant,
): void {
  const newLog: CombatLog = {
    combatId: combat.id,
    messageId: rngUuid(),
    timestamp: Date.now(),
    locationName: combat.locationName,
    message,
    spritesheet: actor?.isEnemy ? 'guardian' : 'hero',
    sprite: actor?.sprite,
  };

  pendingCombatLogMessages.unshift(newLog);
}

export function combatLogReset(): void {
  combatLog.set([]);
  pendingCombatLogMessages = [];
}

export function combatLogHealthColor(
  health: number,
  totalHealth: number,
): string {
  const healthPercentage = Math.round((100 * health) / totalHealth);

  if (healthPercentage >= 75) {
    return 'text-green-400';
  } else if (healthPercentage > 25) {
    return 'text-yellow-400';
  }

  return 'text-rose-400';
}

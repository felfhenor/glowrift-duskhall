import { uuid } from '@helpers/rng';
import { localStorageSignal } from '@helpers/signal';
import type { Combat, CombatLog } from '@interfaces';
import mustache from 'mustache';

export const combatLog = localStorageSignal<CombatLog[]>('combatLog', []);

export function formatCombatMessage(template: string, props: unknown): string {
  return mustache.render(template, props);
}

export function logCombatMessage(combat: Combat, message: string): void {
  const newLog: CombatLog = {
    combatId: combat.id,
    messageId: uuid(),
    timestamp: Date.now(),
    locationName: combat.locationName,
    message,
  };

  combatLog.update((logs) => [newLog, ...logs].slice(0, 500));
}

export function resetCombatLog(): void {
  combatLog.set([]);
}

export function getHealthColor(health: number, totalHealth: number): string {
  const healthPercentage = Math.round((100 * health) / totalHealth);

  if (healthPercentage >= 75) {
    return 'text-green-400';
  } else if (healthPercentage > 25) {
    return 'text-yellow-400';
  }

  return 'text-rose-400';
}

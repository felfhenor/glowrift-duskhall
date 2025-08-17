import { rngUuid } from '@helpers/rng';
import { localStorageSignal } from '@helpers/signal';
import { worldNodeGetAccessId } from '@helpers/world';
import type { ClaimLog, WorldLocation } from '@interfaces';
import mustache from 'mustache';

export const claimLog = localStorageSignal<ClaimLog[]>('claimLog', []);

export function claimFormatMessage(template: string, props: unknown): string {
  return mustache.render(template, props);
}

export function claimMessageLog(node: WorldLocation, message: string): void {
  if (!node.nodeType) return;

  const newLog: ClaimLog = {
    locationId: worldNodeGetAccessId(node),
    messageId: rngUuid(),
    timestamp: Date.now(),
    message,
    locationType: node.nodeType,
    locationName: node.name,
  };

  claimLog.update((logs) => [newLog, ...logs].slice(0, 500));
}

export function claimLogReset(): void {
  claimLog.set([]);
}

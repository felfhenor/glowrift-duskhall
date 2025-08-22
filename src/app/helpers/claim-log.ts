import { rngUuid } from '@helpers/rng';
import { localStorageSignal } from '@helpers/signal';
import { worldNodeGetAccessId } from '@helpers/world';
import type { ClaimLog, WorldLocation } from '@interfaces';
import mustache from 'mustache';

export const claimLog = localStorageSignal<ClaimLog[]>('claimLog', []);

let pendingClaimLogMessages: ClaimLog[] = [];

export function beginClaimLogCommits() {
  pendingClaimLogMessages = [];
}

export function endClaimLogCommits() {
  if (pendingClaimLogMessages.length > 0) {
    claimLog.update((logs) =>
      [...pendingClaimLogMessages, ...logs].slice(0, 500),
    );
  }

  pendingClaimLogMessages = [];
}

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

  pendingClaimLogMessages.unshift(newLog);
}

export function claimLogReset(): void {
  claimLog.set([]);
  pendingClaimLogMessages = [];
}

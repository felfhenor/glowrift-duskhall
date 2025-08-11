import { gamestate } from '@helpers/state-game';
import type { DiscordPresenceOpts } from '@interfaces';
import { sum } from 'es-toolkit/compat';

export function isInElectron() {
  return navigator.userAgent.toLowerCase().includes(' electron/');
}

let discordMainStatus = '';
export function discordSetMainStatus(status: string) {
  discordMainStatus = status;
}

export function discordSetStatus(status: DiscordPresenceOpts) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).discordRPCStatus = {
    ...status,
    details: discordMainStatus || status.details,
  };
}

export function discordUpdateStatus() {
  if (!isInElectron()) return;

  const { nodeCounts, claimedCounts } = gamestate().world;

  const totalNodes = sum(Object.values(nodeCounts));
  const totalClaimed = sum(Object.values(claimedCounts));
  const percent = Math.floor((totalClaimed / totalNodes) * 100);

  discordSetStatus({
    state: 'In game',
    details: `Conquering the world (${totalClaimed}/${totalNodes} | ${percent}%)`,
  });
}

import { gamestate } from '@helpers/state-game';
import type { DiscordPresenceOpts } from '@interfaces';
import { sum } from 'es-toolkit/compat';

export function isInElectron() {
  return navigator.userAgent.toLowerCase().includes(' electron/');
}

let discordMainStatus = '';
export function setMainDiscordStatus(status: string) {
  discordMainStatus = status;
}

export function setDiscordStatus(status: DiscordPresenceOpts) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).discordRPCStatus = {
    ...status,
    details: discordMainStatus || status.details,
  };
}

export function updateDiscordStatus() {
  if (!isInElectron()) return;

  const { nodeCounts, claimedCounts } = gamestate().world;

  const totalNodes = sum(Object.values(nodeCounts));
  const totalClaimed = sum(Object.values(claimedCounts));
  const percent = Math.floor((totalClaimed / totalNodes) * 100);

  setDiscordStatus({
    state: 'In game',
    details: `Conquering the world (${totalClaimed}/${totalNodes} | ${percent}%)`,
  });
}

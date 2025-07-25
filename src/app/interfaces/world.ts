import type { GameElement } from '@interfaces/element';
import type { Identifiable } from '@interfaces/identifiable';
import type { LocationType } from '@interfaces/worldconfig';

export interface WorldPosition {
  x: number;
  y: number;
}

export interface WorldLocationElement {
  element: GameElement;
  intensity: number;
}

export type WorldLocation = WorldPosition &
  Identifiable & {
    nodeType?: LocationType;
    elements: WorldLocationElement[];

    currentlyClaimed: boolean;
    claimCount: number;
    encounterLevel: number;
    unclaimTime: number;

    guardianIds: string[];
    claimLootIds: string[];
  };

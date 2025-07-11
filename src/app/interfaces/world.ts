import { GameElement } from '@interfaces/element';
import { Identifiable } from '@interfaces/identifiable';
import { LocationType } from '@interfaces/worldconfig';

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
    sprite: string;
    objectSprite: string;

    currentlyClaimed: boolean;
    claimCount: number;
    encounterLevel: number;
    unclaimTime: number;

    guardianIds: string[];
    claimLootIds: string[];
  };

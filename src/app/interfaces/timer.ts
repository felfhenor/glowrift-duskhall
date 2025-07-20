import type { WorldPosition } from '@interfaces/world';

export type TimerAction = 'UnclaimVillage';

export interface TimerData {
  type: TimerAction;
}

export interface TimerUnclaimVillage extends TimerData {
  type: 'UnclaimVillage';
  location: WorldPosition;
}

export type Timer = TimerUnclaimVillage;

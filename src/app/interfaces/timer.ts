import type { Branded } from '@interfaces/identifiable';
import type { WorldPosition } from '@interfaces/world';

export type TimerId = Branded<string, 'TimerId'>;

export type TimerAction = 'UNKNOWN' | 'UnclaimVillage';

export interface TimerData {
  type: TimerAction;
  id: TimerId;
  tick: number;
}

export type TimerUnclaimVillage = TimerData & {
  type: 'UnclaimVillage';
  location: WorldPosition;
};

export type Timer = TimerUnclaimVillage;

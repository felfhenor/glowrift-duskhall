import type { FestivalId } from '@interfaces/content-festival';
import type { Branded } from '@interfaces/identifiable';
import type { WorldPosition } from '@interfaces/world';

export type TimerId = Branded<string, 'TimerId'>;

export type TimerAction =
  | 'UNKNOWN'
  | 'UnclaimVillage'
  | 'EndFestival'
  | 'MerchantRefresh';

export interface TimerData {
  type: TimerAction;
  id: TimerId;
  tick: number;
}

export type TimerUnclaimVillage = TimerData & {
  type: 'UnclaimVillage';
  location: WorldPosition;
};

export type TimerEndFestival = TimerData & {
  type: 'EndFestival';
  festivalId: FestivalId;
};

export type TimerMerchantRefresh = TimerData & {
  type: 'MerchantRefresh';
  nextTicks: number;
};

export type Timer =
  | TimerUnclaimVillage
  | TimerEndFestival
  | TimerMerchantRefresh;

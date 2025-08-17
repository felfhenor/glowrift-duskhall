import type { LocationType } from '@interfaces/content-worldconfig';

export interface ClaimLog {
  locationId: string;
  messageId: string;
  timestamp: number;
  locationName: string;
  message: string;
  locationType: LocationType;
}

import type { DuskmoteBundleId } from '@interfaces/content-duskmotebundle';

export interface AscensionCopyData {
  numAscends: number;
  totalDuskmotes: number;
  bundles: Record<DuskmoteBundleId, boolean>;
}

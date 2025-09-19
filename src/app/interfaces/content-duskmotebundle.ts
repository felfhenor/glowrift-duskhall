import type {
  Branded,
  Identifiable,
  IsContentItem,
} from '@interfaces/identifiable';
import type { HasDescription } from '@interfaces/traits';

export type DuskmoteBundleId = Branded<string, 'DuskmoteBundleId'>;

export type DuskmoteBundleContent = Identifiable &
  HasDescription &
  IsContentItem & {
    id: DuskmoteBundleId;

    cost: number;
  };

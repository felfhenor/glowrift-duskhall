import type { Identifiable, IsContentItem } from '@interfaces/identifiable';
import type { HasDescription } from '@interfaces/traits';

export type HelpContent = Identifiable &
  IsContentItem &
  HasDescription & {
    category: string;
  };

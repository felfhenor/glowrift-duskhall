import type { Artable } from '@interfaces/artable';
import type { Identifiable, IsContentItem } from '@interfaces/identifiable';

export type CameoContent = Identifiable &
  Artable &
  IsContentItem & {
    contribution: string;
  };

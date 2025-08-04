import type { TalentId } from '@interfaces/content-talent';
import type { Branded, IsContentItem } from '@interfaces/identifiable';

export type TalentTreeId = Branded<string, 'TalentTreeId'>;

export interface TalentTreeContentNode {
  talentId: TalentId;
}

export interface TalentTreeContentLevel {
  level: number;
  learnableTalents: TalentTreeContentNode[];
}

export type TalentTreeContent = IsContentItem & {
  id: TalentTreeId;
  talents: TalentTreeContentLevel[];
};

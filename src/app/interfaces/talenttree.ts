import type { IsContentItem } from '@interfaces/identifiable';

export interface TalentTreeContentNode {
  talentId: string;
}

export interface TalentTreeContentLevel {
  level: number;
  learnableTalents: TalentTreeContentNode[];
}

export interface TalentTreeContent extends IsContentItem {
  talents: TalentTreeContentLevel[];
}

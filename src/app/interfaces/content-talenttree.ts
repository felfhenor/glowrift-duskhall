import type { TalentId } from '@interfaces/content-talent';
import type { GameElement, GameElementExtended } from '@interfaces/element';
import type { Branded, IsContentItem } from '@interfaces/identifiable';

export type TalentTreeId = Branded<string, 'TalentTreeId'>;

export interface TalentTreeContentNode {
  talentId: TalentId;
}

export interface TalentTreeContentLevel {
  level: number;
  learnableTalents: TalentTreeContentNode[];
  requiredTalentsInvested?: number;
}

export type TalentTreeContent = IsContentItem & {
  id: TalentTreeId;
  element: GameElement | GameElementExtended;
  talents: TalentTreeContentLevel[];
};

import type { Artable } from '@interfaces/artable';
import type { GameElement } from '@interfaces/element';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';

export type TalentId = Branded<string, 'TalentId'>;

export interface TalentContent extends IsContentItem, Artable {
  id: TalentId;

  description: string;

  requireTalentId?: string;

  boostedElements: GameElement[];
  boostedSkillIds: string[];
  boostStats: StatBlock;

  boostedStatusEffectIds: string[];
  boostedStatusEffectChance: number;
  boostStatusEffectStats: StatBlock;
}

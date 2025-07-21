import type { Artable } from '@interfaces/artable';
import type { GameElement } from '@interfaces/element';
import type { Branded, Content } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';

export type TalentId = Branded<string, 'TalentId'>;

export interface TalentContent extends Content, Artable {
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

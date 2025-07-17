import { Artable } from '@interfaces/artable';
import { GameElement } from '@interfaces/element';
import { Branded, Content } from '@interfaces/identifiable';
import { StatBlock } from '@interfaces/stat';

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

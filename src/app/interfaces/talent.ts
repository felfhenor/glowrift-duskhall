import { Artable } from './artable';
import { GameElement } from './element';
import { Branded, Content } from './identifiable';
import { StatBlock } from './stat';

export type TalentId = Branded<string, 'TalentId'>;

export interface TalentDefinition extends Content, Artable {
  id: TalentId;

  description: string;

  requireTalentId?: string;

  boostedElements: GameElement[];
  boostedSkillIds: string[];
  boostStats: StatBlock;
}

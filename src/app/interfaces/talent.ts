import { Artable } from './artable';
import { Content } from './identifiable';
import { StatBlock } from './stat';

export interface TalentDefinition extends Content, Artable {
  description: string;

  requireTalentId?: string;

  boostedSkillIds: string[];
  boostStats: StatBlock;
}

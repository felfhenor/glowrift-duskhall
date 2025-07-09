import { Content } from './identifiable';

export interface TalentTreeDefinitionNode {
  talentId: string;
}

export interface TalentTreeDefinitionLevel {
  level: number;
  learnableTalents: TalentTreeDefinitionNode[];
}

export interface TalentTreeDefinition extends Content {
  talents: TalentTreeDefinitionLevel[];
}

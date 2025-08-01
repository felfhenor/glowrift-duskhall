import type { Artable } from '@interfaces/artable';
import type { GameElement } from '@interfaces/element';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';
import type { HasDescription } from '@interfaces/traits';

export type TalentId = Branded<string, 'TalentId'>;

export type TalentContent = IsContentItem &
  Artable &
  HasDescription & {
    id: TalentId;

    requireTalentId?: string;

    applyToElements: GameElement[];
    applyToSkillIds: string[];
    applyToStatusEffectIds: string[];

    boostStats: StatBlock;

    boostedStatusEffectChance: number;
    boostStatusEffectStats: StatBlock;

    additionalTargets: number;
  };

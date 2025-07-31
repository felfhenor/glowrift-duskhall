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

    boostedElements: GameElement[];
    boostedSkillIds: string[];
    boostStats: StatBlock;

    boostedStatusEffectIds: string[];
    boostedStatusEffectChance: number;
    boostStatusEffectStats: StatBlock;
  };

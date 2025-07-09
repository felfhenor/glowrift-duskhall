import { Component, computed, input, Signal } from '@angular/core';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import {
  canHeroBuyTalent,
  getEntry,
  heroHasTalent,
  heroSpendTalentPoint,
} from '../../helpers';
import {
  GameElement,
  Hero,
  TalentDefinition,
  TalentTreeDefinition,
  TalentTreeDefinitionLevel,
  TalentTreeDefinitionNode,
} from '../../interfaces';
import { IconTalentComponent } from '../icon-talent/icon-talent.component';

type TalentTreeHeroNode = TalentTreeDefinitionNode & {
  talentData: TalentDefinition;
  canPurchase: boolean;
  isLearned: boolean;
};

type TalentTreeHeroLevel = TalentTreeDefinitionLevel & {
  learnableTalents: TalentTreeHeroNode[];
};

type TalentTreeHeroDefinition = TalentTreeDefinition & {
  talents: TalentTreeHeroLevel[];
};

@Component({
  selector: 'app-panel-heroes-talents-tree',
  imports: [IconTalentComponent, SweetAlert2Module],
  templateUrl: './panel-heroes-talents-tree.component.html',
  styleUrl: './panel-heroes-talents-tree.component.scss',
})
export class PanelHeroesTalentsTreeComponent {
  public hero = input.required<Hero>();
  public element = input.required<GameElement>();

  public tree: Signal<TalentTreeHeroDefinition> = computed(() => {
    const talentTree = getEntry<TalentTreeDefinition>(
      `${this.element()} Talent Tree`,
    )!;

    talentTree.talents = talentTree.talents.map((level) => {
      level.learnableTalents = level.learnableTalents.map((talentNode) => {
        const talentData = getEntry<TalentDefinition>(talentNode.talentId)!;
        return {
          ...talentNode,
          talentData,
          isLearned: heroHasTalent(this.hero(), talentData.id),
          canPurchase: canHeroBuyTalent(this.hero(), talentData, level.level),
        } as TalentTreeHeroNode;
      }) as TalentTreeHeroNode[];

      return level;
    });

    return talentTree as TalentTreeHeroDefinition;
  });

  learnTalent(talent: TalentTreeHeroNode): void {
    heroSpendTalentPoint(this.hero(), talent.talentData.id);
  }
}

import { Component, computed, input, Signal } from '@angular/core';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import {
  canHeroBuyTalent,
  getEntry,
  heroHasTalent,
  heroSpendTalentPoint,
} from '@helpers';
import {
  GameElement,
  Hero,
  TalentContent,
  TalentTreeContent,
  TalentTreeContentLevel,
  TalentTreeContentNode,
} from '@interfaces';
import { IconTalentComponent } from '@components/icon-talent/icon-talent.component';

type TalentTreeHeroNode = TalentTreeContentNode & {
  talentData: TalentContent;
  canPurchase: boolean;
  isLearned: boolean;
};

type TalentTreeHeroLevel = TalentTreeContentLevel & {
  learnableTalents: TalentTreeHeroNode[];
};

type TalentTreeHeroDefinition = TalentTreeContent & {
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
    const talentTree = getEntry<TalentTreeContent>(
      `${this.element()} Talent Tree`,
    )!;

    talentTree.talents = talentTree.talents.map((level) => {
      level.learnableTalents = level.learnableTalents.map((talentNode) => {
        const talentData = getEntry<TalentContent>(talentNode.talentId)!;
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

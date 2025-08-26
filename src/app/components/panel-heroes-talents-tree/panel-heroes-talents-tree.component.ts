import type { Signal } from '@angular/core';
import { Component, computed, input } from '@angular/core';
import { IconTalentComponent } from '@components/icon-talent/icon-talent.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { SFXDirective } from '@directives/sfx.directive';
import {
  getEntry,
  heroCanBuyTalent,
  heroHasTalent,
  heroSpendTalentPoint,
  heroTalentsInvestedInTree,
  heroTotalTalentLevel,
  playSFX,
} from '@helpers';
import type {
  GameElement,
  Hero,
  TalentContent,
  TalentTreeContent,
  TalentTreeContentLevel,
  TalentTreeContentNode,
} from '@interfaces';
import type { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

type TalentTreeHeroNode = TalentTreeContentNode & {
  talentData: TalentContent;
  canPurchase: boolean;
  isLearned: boolean;
  talentLevel: number;
  requiredTalentsInvested: number;
  currentTalentsInvested: number;
};

type TalentTreeHeroLevel = TalentTreeContentLevel & {
  learnableTalents: TalentTreeHeroNode[];
};

type TalentTreeHeroDefinition = TalentTreeContent & {
  talents: TalentTreeHeroLevel[];
};

@Component({
  selector: 'app-panel-heroes-talents-tree',
  imports: [
    IconTalentComponent,
    SweetAlert2Module,
    AnalyticsClickDirective,
    SFXDirective,
  ],
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

    const currentTalentsInvested = heroTalentsInvestedInTree(
      this.hero(),
      talentTree,
    );

    talentTree.talents = talentTree.talents.map((level) => {
      level.learnableTalents = level.learnableTalents.map((talentNode) => {
        const talentData = getEntry<TalentContent>(talentNode.talentId)!;
        return {
          ...talentNode,
          talentData,
          isLearned: heroHasTalent(this.hero(), talentData.id),
          canPurchase: heroCanBuyTalent(
            this.hero(),
            talentData,
            level.level,
            talentTree,
            level.requiredTalentsInvested,
          ),
          talentLevel: heroTotalTalentLevel(this.hero(), talentData.id),
          requiredTalentsInvested: level.requiredTalentsInvested,
          currentTalentsInvested,
        } as TalentTreeHeroNode;
      }) as TalentTreeHeroNode[];

      return level;
    });

    return talentTree as TalentTreeHeroDefinition;
  });

  tryLearnTalent(swal: SwalComponent, talent: TalentTreeHeroNode): void {
    if (!talent.canPurchase) return;
    swal.fire();
  }

  learnTalent(talent: TalentTreeHeroNode): void {
    heroSpendTalentPoint(this.hero(), talent.talentData.id);
    playSFX('item-get-minor', 0);
  }
}

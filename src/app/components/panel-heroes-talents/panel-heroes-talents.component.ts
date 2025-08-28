import type { OnChanges, Signal, SimpleChanges } from '@angular/core';
import { Component, computed, input } from '@angular/core';
import { IconElementComponent } from '@components/icon-element/icon-element.component';
import { PanelHeroesTalentsTreeComponent } from '@components/panel-heroes-talents-tree/panel-heroes-talents-tree.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { SFXDirective } from '@directives/sfx.directive';
import {
  getEntry,
  getOption,
  heroRemainingTalentPoints,
  setOption,
  talentIdsInTalentTree,
  talentRespec,
} from '@helpers';
import type { TalentTreeContent } from '@interfaces';
import { type GameElement, type Hero } from '@interfaces';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { intersection, maxBy } from 'es-toolkit/compat';

@Component({
  selector: 'app-panel-heroes-talents',
  imports: [
    IconElementComponent,
    PanelHeroesTalentsTreeComponent,
    SweetAlert2Module,
    AnalyticsClickDirective,
    SFXDirective,
  ],
  templateUrl: './panel-heroes-talents.component.html',
  styleUrl: './panel-heroes-talents.component.scss',
})
export class PanelHeroesTalentsComponent implements OnChanges {
  public hero = input.required<Hero>();

  public currentElement = computed(() =>
    getOption('selectedTalentTreeElement'),
  );

  public pointsAvailable = computed(() =>
    heroRemainingTalentPoints(this.hero()),
  );

  public allTalents: Signal<Array<{ element: GameElement; amount: number }>> =
    computed(() => [
      {
        element: 'Earth',
        amount: intersection(
          Object.keys(this.hero().talents),
          talentIdsInTalentTree(
            getEntry<TalentTreeContent>('Earth Talent Tree')!,
          ),
        ).length,
      },
      {
        element: 'Fire',
        amount: intersection(
          Object.keys(this.hero().talents),
          talentIdsInTalentTree(
            getEntry<TalentTreeContent>('Fire Talent Tree')!,
          ),
        ).length,
      },
      {
        element: 'Water',
        amount: intersection(
          Object.keys(this.hero().talents),
          talentIdsInTalentTree(
            getEntry<TalentTreeContent>('Water Talent Tree')!,
          ),
        ).length,
      },
      {
        element: 'Air',
        amount: intersection(
          Object.keys(this.hero().talents),
          talentIdsInTalentTree(
            getEntry<TalentTreeContent>('Air Talent Tree')!,
          ),
        ).length,
      },
    ]);

  ngOnChanges(changes: SimpleChanges) {
    const { hero } = changes;
    if (hero.currentValue?.id !== hero.previousValue?.id) {
      this.setToBiggestTree();
    }
  }

  public changeElement(element: GameElement): void {
    setOption('selectedTalentTreeElement', element);
  }

  public respecHero(): void {
    talentRespec(this.hero());
  }

  private setToBiggestTree() {
    if (!getOption('switchToBiggestTreeOnHeroChange')) return;

    const biggestTree = maxBy(this.allTalents(), (t) => t.amount);
    if (biggestTree) {
      setTimeout(() => {
        this.changeElement(biggestTree.element);
      }, 0);
    }
  }
}

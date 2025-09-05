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
import type { JobContent, TalentTreeContent, TalentTreeId } from '@interfaces';
import { type Hero } from '@interfaces';
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

  public currentTreeId = computed(() => getOption('selectedTalentTreeId'));

  public currentTree = computed(
    () =>
      getEntry<TalentTreeContent>(this.currentTreeId()) as TalentTreeContent,
  );

  public pointsAvailable = computed(() =>
    heroRemainingTalentPoints(this.hero()),
  );

  public allTrees: Signal<Array<{ amount: number; tree: TalentTreeContent }>> =
    computed(() => {
      const job = getEntry<JobContent>(this.hero().jobId);
      if (!job) return [];

      const talentTrees = job.talentTreeIds
        .map((id) => getEntry<TalentTreeContent>(id))
        .filter(Boolean) as TalentTreeContent[];

      return talentTrees.map((tree) => ({
        amount: intersection(
          Object.keys(this.hero().talents),
          talentIdsInTalentTree(tree),
        ).length,
        tree,
      }));
    });

  ngOnChanges(changes: SimpleChanges) {
    const { hero } = changes;
    if (hero.currentValue?.id !== hero.previousValue?.id) {
      this.setToBiggestTree();
    }
  }

  public changeTree(treeId: TalentTreeId): void {
    setOption('selectedTalentTreeId', treeId);
  }

  public respecHero(): void {
    talentRespec(this.hero());
  }

  private setToBiggestTree() {
    if (!getOption('switchToBiggestTreeOnHeroChange')) return;

    const biggestTree = maxBy(this.allTrees(), (t) => t.amount);
    if (biggestTree) {
      setTimeout(() => {
        this.changeTree(biggestTree.tree.id);
      }, 0);
    }
  }
}

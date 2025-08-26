import type { Signal } from '@angular/core';
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
import { intersection } from 'es-toolkit/compat';

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
export class PanelHeroesTalentsComponent {
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

  public changeElement(element: GameElement): void {
    setOption('selectedTalentTreeElement', element);
  }

  public respecHero(): void {
    talentRespec(this.hero());
  }
}

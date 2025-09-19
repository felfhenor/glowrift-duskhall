import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MarkerElementComponent } from '@components/marker-element/marker-element.component';
import { MarkerHeroNameComponent } from '@components/marker-hero-name/marker-hero-name.component';
import { MarkerStatComponent } from '@components/marker-stat/marker-stat.component';
import { heroElements, heroXpRequiredForLevelUp } from '@helpers';
import type { Hero } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-panel-heroes-stats',
  imports: [
    CommonModule,
    MarkerStatComponent,
    MarkerElementComponent,
    TippyDirective,
    MarkerHeroNameComponent,
  ],
  templateUrl: './panel-heroes-stats.component.html',
  styleUrl: './panel-heroes-stats.component.scss',
})
export class PanelHeroesStatsComponent {
  public hero = input.required<Hero>();

  public heroStats = computed(() => this.hero().totalStats);
  public maxXp = computed(() => heroXpRequiredForLevelUp(this.hero().level));

  public heroElements = computed(() => heroElements(this.hero()));
}

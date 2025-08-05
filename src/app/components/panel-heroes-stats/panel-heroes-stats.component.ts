import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MarkerElementComponent } from '@components/marker-element/marker-element.component';
import { MarkerStatComponent } from '@components/marker-stat/marker-stat.component';
import { heroElements, heroXpRequiredForLevelUp } from '@helpers';
import type { Hero } from '@interfaces';

@Component({
  selector: 'app-panel-heroes-stats',
  imports: [CommonModule, MarkerStatComponent, MarkerElementComponent],
  templateUrl: './panel-heroes-stats.component.html',
  styleUrl: './panel-heroes-stats.component.scss',
})
export class PanelHeroesStatsComponent {
  public hero = input.required<Hero>();

  public heroStats = computed(() => this.hero().totalStats);
  public maxXp = computed(() => heroXpRequiredForLevelUp(this.hero().level));

  public heroElements = computed(() => heroElements(this.hero()));
}

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { heroXpRequiredForLevelUp } from '@helpers';
import type { Hero } from '@interfaces';
import { MarkerStatComponent } from '@components/marker-stat/marker-stat.component';

@Component({
  selector: 'app-panel-heroes-stats',
  imports: [CommonModule, MarkerStatComponent],
  templateUrl: './panel-heroes-stats.component.html',
  styleUrl: './panel-heroes-stats.component.scss',
})
export class PanelHeroesStatsComponent {
  public hero = input.required<Hero>();

  public heroStats = computed(() => this.hero().totalStats);
  public maxXp = computed(() => heroXpRequiredForLevelUp(this.hero().level));
}

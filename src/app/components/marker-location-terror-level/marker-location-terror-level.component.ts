import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { WorldLocationTerrorLevel } from '@interfaces/world';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-marker-location-terror-level',
  imports: [NgClass, TippyDirective],
  templateUrl: './marker-location-terror-level.component.html',
  styleUrl: './marker-location-terror-level.component.scss',
})
export class MarkerLocationTerrorLevelComponent {
  public terrorLevel = input.required<WorldLocationTerrorLevel>();

  public terrorColors = computed(() => {
    const colors: Record<WorldLocationTerrorLevel, string[]> = {
      Fatal: ['text-red-500', 'outline-red-500'],
      Terrifying: ['text-purple-500', 'outline-purple-500'],
      Scary: ['text-yellow-500', 'outline-yellow-500'],
      Uncomfortable: ['text-orange-500', 'outline-orange-500'],
      Safe: ['text-green-500', 'outline-green-500'],
    };

    return colors[this.terrorLevel()];
  });

  public terrorInfo = computed(() => {
    const info: Record<WorldLocationTerrorLevel, string> = {
      Fatal:
        'These creatures could potentially do >=100% of your heroes total health per round.',
      Terrifying:
        'These creatures could potentially do 75% of your heroes total health per round.',
      Scary:
        'These creatures could potentially do 50% of your heroes total health per round.',
      Uncomfortable:
        'These creatures could potentially do 25% of your heroes total health per round.',
      Safe: 'These creatures could potentially do at most 10% of your heroes total health per round.',
    };

    return info[this.terrorLevel()];
  });
}

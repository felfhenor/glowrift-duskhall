import { Component, computed, input } from '@angular/core';
import { heroGetName } from '@helpers/hero';
import type { Hero } from '@interfaces/hero';

@Component({
  selector: 'app-marker-hero-name',
  imports: [],
  templateUrl: './marker-hero-name.component.html',
  styleUrl: './marker-hero-name.component.scss',
})
export class MarkerHeroNameComponent {
  public hero = input.required<Hero>();

  public heroName = computed(() => heroGetName(this.hero()));
}

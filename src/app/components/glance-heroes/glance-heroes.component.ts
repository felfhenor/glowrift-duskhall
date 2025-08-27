import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { IconHeroComponent } from '@components/icon-hero/icon-hero.component';
import { allHeroes } from '@helpers/hero';
import { heroXpRequiredForLevelUp } from '@helpers/hero-xp';

@Component({
  selector: 'app-glance-heroes',
  imports: [IconHeroComponent, DecimalPipe],
  templateUrl: './glance-heroes.component.html',
  styleUrl: './glance-heroes.component.scss',
})
export class GlanceHeroesComponent {
  public showFullInfo = signal<boolean>(false);

  public heroes = computed(() =>
    allHeroes().map((h) => ({
      ...h,
      maxXp: heroXpRequiredForLevelUp(h.level),
    })),
  );
}

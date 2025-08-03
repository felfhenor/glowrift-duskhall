import { Component, input } from '@angular/core';
import type { Hero } from '@interfaces';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';

@Component({
  selector: 'app-icon-hero-combat',
  imports: [AtlasAnimationComponent],
  templateUrl: './icon-hero-combat.component.html',
  styleUrl: './icon-hero-combat.component.scss',
})
export class IconHeroCombatComponent {
  public hero = input.required<Hero>();
}

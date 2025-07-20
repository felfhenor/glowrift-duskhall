import { Component, input } from '@angular/core';
import type { Hero } from '@interfaces';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';

@Component({
  selector: 'app-icon-hero',
  imports: [AtlasAnimationComponent],
  templateUrl: './icon-hero.component.html',
  styleUrl: './icon-hero.component.scss',
})
export class IconHeroComponent {
  public hero = input.required<Hero>();
}

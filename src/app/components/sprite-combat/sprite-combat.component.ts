import { Component, input } from '@angular/core';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';

@Component({
  selector: 'app-sprite-combat',
  imports: [AtlasAnimationComponent],
  templateUrl: './sprite-combat.component.html',
  styleUrl: './sprite-combat.component.scss',
})
export class SpriteCombatComponent {
  public spritesheet = input.required<'hero' | 'guardian'>();
  public sprite = input.required<string>();
}

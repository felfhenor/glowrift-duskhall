import { Component, input } from '@angular/core';
import type { Guardian } from '@interfaces';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';

@Component({
  selector: 'app-icon-guardian-combat',
  imports: [AtlasAnimationComponent],
  templateUrl: './icon-guardian-combat.component.html',
  styleUrl: './icon-guardian-combat.component.scss',
})
export class IconGuardianCombatComponent {
  public guardian = input.required<Guardian>();
}

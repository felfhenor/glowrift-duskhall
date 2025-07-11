import { Component, input } from '@angular/core';
import { Guardian } from '@interfaces';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';

@Component({
  selector: 'app-icon-guardian',
  imports: [AtlasAnimationComponent],
  templateUrl: './icon-guardian.component.html',
  styleUrl: './icon-guardian.component.scss',
})
export class IconGuardianComponent {
  public guardian = input.required<Guardian>();
}

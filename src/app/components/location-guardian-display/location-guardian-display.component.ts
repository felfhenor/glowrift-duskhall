import { Component, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { Guardian } from '@interfaces';
import { IconGuardianComponent } from '@components/icon-guardian/icon-guardian.component';
import { MarkerStatComponent } from '@components/marker-stat/marker-stat.component';

@Component({
  selector: 'app-location-guardian-display',
  imports: [TippyDirective, MarkerStatComponent, IconGuardianComponent],
  templateUrl: './location-guardian-display.component.html',
  styleUrl: './location-guardian-display.component.scss',
})
export class LocationGuardianDisplayComponent {
  public guardian = input.required<Guardian>();
}

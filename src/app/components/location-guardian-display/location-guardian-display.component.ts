import { Component, computed, input } from '@angular/core';
import { IconGuardianComponent } from '@components/icon-guardian/icon-guardian.component';
import { MarkerElementComponent } from '@components/marker-element/marker-element.component';
import { MarkerStatComponent } from '@components/marker-stat/marker-stat.component';
import { getEntry } from '@helpers/content';
import type { EquipmentSkillContent, Guardian } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-location-guardian-display',
  imports: [
    TippyDirective,
    MarkerStatComponent,
    IconGuardianComponent,
    MarkerElementComponent,
  ],
  templateUrl: './location-guardian-display.component.html',
  styleUrl: './location-guardian-display.component.scss',
})
export class LocationGuardianDisplayComponent {
  public guardian = input.required<Guardian>();

  public skills = computed(
    () =>
      this.guardian()
        .skillIds.map(getEntry<EquipmentSkillContent>)
        .filter(Boolean) as EquipmentSkillContent[],
  );
}

import { Component, input } from '@angular/core';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { StatsTalentComponent } from '@components/stats-talent/stats-talent.component';
import type { TalentContent } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-icon-talent',
  imports: [
    IconBlankSlotComponent,
    AtlasImageComponent,
    TippyDirective,
    StatsTalentComponent,
  ],
  templateUrl: './icon-talent.component.html',
  styleUrl: './icon-talent.component.scss',
})
export class IconTalentComponent {
  public talent = input.required<TalentContent>();
  public isBought = input<boolean>(false);
}

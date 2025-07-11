import { Component, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { TalentContent } from '@interfaces';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { ContentNameComponent } from '@components/content-name/content-name.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';

@Component({
  selector: 'app-icon-talent',
  imports: [
    IconBlankSlotComponent,
    AtlasImageComponent,
    TippyDirective,
    ContentNameComponent,
  ],
  templateUrl: './icon-talent.component.html',
  styleUrl: './icon-talent.component.scss',
})
export class IconTalentComponent {
  public talent = input.required<TalentContent>();
  public isBought = input<boolean>(false);
}

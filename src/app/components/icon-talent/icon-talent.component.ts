import { Component, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { TalentDefinition } from '../../interfaces';
import { AtlasImageComponent } from '../atlas-image/atlas-image.component';
import { ContentNameComponent } from '../content-name/content-name.component';
import { IconBlankSlotComponent } from '../icon-blank-slot/icon-blank-slot.component';

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
  public talent = input.required<TalentDefinition>();
  public isBought = input<boolean>(false);
}

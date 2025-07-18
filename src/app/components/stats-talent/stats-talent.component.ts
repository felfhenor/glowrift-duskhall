import { Component, input } from '@angular/core';
import { ContentNameComponent } from '@components/content-name/content-name.component';
import { TalentContent } from '@interfaces';

@Component({
  selector: 'app-stats-talent',
  templateUrl: './stats-talent.component.html',
  styleUrl: './stats-talent.component.css',
  imports: [ContentNameComponent],
})
export class StatsTalentComponent {
  public talent = input.required<TalentContent>();
}

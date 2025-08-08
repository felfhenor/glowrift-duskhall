import { Component, input } from '@angular/core';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-marker-trait',
  imports: [TippyDirective],
  templateUrl: './marker-trait.component.html',
  styleUrl: './marker-trait.component.scss',
})
export class MarkerTraitComponent {
  public trait = input.required<TraitEquipmentContent>();
}

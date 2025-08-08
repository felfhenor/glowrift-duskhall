import { Component, input } from '@angular/core';
import type { TraitLocationContent } from '@interfaces/content-trait-location';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-marker-location-trait',
  imports: [TippyDirective],
  templateUrl: './marker-location-trait.component.html',
  styleUrl: './marker-location-trait.component.scss',
})
export class MarkerLocationTraitComponent {
  public trait = input.required<TraitLocationContent>();
}

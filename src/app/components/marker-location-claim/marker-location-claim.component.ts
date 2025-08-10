import { Component, input } from '@angular/core';
import type { WorldLocation } from '@interfaces';

@Component({
  selector: 'app-marker-location-claim',
  imports: [],
  templateUrl: './marker-location-claim.component.html',
  styleUrl: './marker-location-claim.component.scss',
})
export class MarkerLocationClaimComponent {
  public location = input.required<WorldLocation>();
}

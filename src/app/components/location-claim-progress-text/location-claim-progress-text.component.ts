import { Component, computed } from '@angular/core';
import { exploreProgressText } from '@helpers';

@Component({
  selector: 'app-location-claim-progress-text',
  imports: [],
  templateUrl: './location-claim-progress-text.component.html',
  styleUrl: './location-claim-progress-text.component.scss',
})
export class LocationClaimProgressTextComponent {
  public claimProgress = computed(() => exploreProgressText());
}

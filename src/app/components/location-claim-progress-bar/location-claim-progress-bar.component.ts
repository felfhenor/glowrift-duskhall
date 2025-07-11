import { Component, computed } from '@angular/core';
import { exploreProgressPercent } from '@helpers';

@Component({
  selector: 'app-location-claim-progress-bar',
  imports: [],
  templateUrl: './location-claim-progress-bar.component.html',
  styleUrl: './location-claim-progress-bar.component.scss',
})
export class LocationClaimProgressBarComponent {
  public claimProgress = computed(() => exploreProgressPercent());
}

import { Component, computed } from '@angular/core';
import { gamestate } from '@helpers';
import { IconLocationComponent } from '@components/icon-location/icon-location.component';

@Component({
  selector: 'app-panel-combat-claims',
  imports: [IconLocationComponent],
  templateUrl: './panel-combat-claims.component.html',
  styleUrl: './panel-combat-claims.component.scss',
})
export class PanelCombatClaimsComponent {
  public maxClaims = computed(() => gamestate().world.nodeCounts);
  public claims = computed(() => gamestate().world.claimedCounts);
}

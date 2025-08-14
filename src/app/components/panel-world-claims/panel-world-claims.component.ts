import { Component, computed } from '@angular/core';
import { IconLocationComponent } from '@components/icon-location/icon-location.component';
import { gamestate } from '@helpers';
import type { LocationType } from '@interfaces/content-worldconfig';

@Component({
  selector: 'app-panel-world-claims',
  imports: [IconLocationComponent],
  templateUrl: './panel-world-claims.component.html',
  styleUrl: './panel-world-claims.component.scss',
})
export class PanelWorldClaimsComponent {
  public maxClaims = computed(() => gamestate().world.nodeCounts);
  public claims = computed(() => gamestate().world.claimedCounts);

  public claimsOrdered = computed(() => {
    const claims = this.claims();
    const maxClaims = this.maxClaims();

    return ['cave', 'dungeon', 'castle', 'village', 'town'].map((loc) => ({
      nodeType: loc as LocationType,
      owned: claims[loc as LocationType],
      total: maxClaims[loc as LocationType],
    }));
  });
}

import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { IconLocationComponent } from '@components/icon-location/icon-location.component';
import { gamestate } from '@helpers/state-game';
import type { LocationType } from '@interfaces/content-worldconfig';

@Component({
  selector: 'app-glance-claims',
  imports: [IconLocationComponent, DecimalPipe, TitleCasePipe],
  templateUrl: './glance-claims.component.html',
  styleUrl: './glance-claims.component.scss',
})
export class GlanceClaimsComponent {
  public showNames = signal<boolean>(false);

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

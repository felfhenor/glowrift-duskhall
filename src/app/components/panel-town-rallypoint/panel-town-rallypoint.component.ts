import { Component, computed } from '@angular/core';
import { ButtonCostListComponent } from '@components/button-cost-list/button-cost-list.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { getEntriesByType } from '@helpers/content';
import { townBuyUpgrade, townHasUpgrade } from '@helpers/town';
import { canBuyRallyPointUpgrade } from '@helpers/town-rallypoint';
import type { TownUpgradeContent } from '@interfaces/content-townupgrade';
import { sortBy } from 'es-toolkit/compat';

@Component({
  selector: 'app-panel-town-rallypoint',
  imports: [
    PanelTownBuildingUpgradeComponent,
    ButtonCostListComponent,
    AnalyticsClickDirective,
  ],
  templateUrl: './panel-town-rallypoint.component.html',
  styleUrl: './panel-town-rallypoint.component.scss',
})
export class PanelTownRallyPointComponent {
  public allUpgrades = computed(() =>
    sortBy(
      getEntriesByType<TownUpgradeContent>('townupgrade').map((upg) => ({
        ...upg,
        canBuy: canBuyRallyPointUpgrade(upg),
        alreadyOwned: townHasUpgrade(upg),
      })),
      'levelRequirement',
    ),
  );

  buyUpgrade(upgrade: TownUpgradeContent) {
    townBuyUpgrade(upgrade);
  }
}

import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconItemComponent } from '@components/icon-currency/icon-currency.component';
import { IconLocationComponent } from '@components/icon-location/icon-location.component';
import {
  buildingMaxLevel,
  buildingUpgradeCost,
  canUpgradeBuildingLevel,
  gamestate,
  getBuildingLevel,
  hasClaimedNodeCount,
  hasCurrency,
  upgradeBuildingLevel,
} from '@helpers';
import { GameCurrency, LocationType, TownBuilding } from '@interfaces';

@Component({
  selector: 'app-panel-town-building-upgrade',
  imports: [IconLocationComponent, IconItemComponent, DecimalPipe],
  templateUrl: './panel-town-building-upgrade.component.html',
  styleUrl: './panel-town-building-upgrade.component.scss',
})
export class PanelTownBuildingUpgradeComponent {
  public building = input.required<TownBuilding>();

  public nextLevel = computed(() => getBuildingLevel(this.building()) + 1);

  public canUpgrade = computed(() => canUpgradeBuildingLevel(this.building()));
  public upgradeRequirements = computed(() =>
    buildingUpgradeCost(this.building()),
  );

  public isMaxLevel = computed(
    () =>
      buildingMaxLevel(this.building()) <= getBuildingLevel(this.building()),
  );

  public liberationRequirements = computed(() => {
    const reqs = this.upgradeRequirements().liberation;
    return Object.keys(reqs)
      .map((key) => ({
        key: key as LocationType,
        value: reqs[key as LocationType],
      }))
      .filter(({ value }) => value > 0);
  });

  public currencyRequirements = computed(() => {
    const reqs = this.upgradeRequirements().currency;
    return Object.keys(reqs)
      .map((key) => ({
        key: key as GameCurrency,
        value: reqs[key as GameCurrency],
      }))
      .filter(({ value }) => value > 0);
  });

  public currentLiberations = computed(() => gamestate().world.claimedCounts);
  public currentCurrencies = computed(() => gamestate().currency.currencies);

  public hasNodeClaim(type: LocationType, num: number) {
    return hasClaimedNodeCount(type, num);
  }

  public hasCurrency(type: GameCurrency, num: number) {
    return hasCurrency(type, num);
  }

  public upgrade() {
    upgradeBuildingLevel(this.building());
  }
}

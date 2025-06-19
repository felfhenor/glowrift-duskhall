import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  buildingUpgradeCost,
  canUpgradeBuildingLevel,
  gamestate,
  getBuildingLevel,
  hasClaimedNodeCount,
  hasCurrency,
  upgradeBuildingLevel,
} from '../../helpers';
import { GameCurrency, LocationType, TownBuilding } from '../../interfaces';
import { IconItemComponent } from '../icon-currency/icon-currency.component';
import { IconLocationComponent } from '../icon-location/icon-location.component';

// Hardcoded max levels for each building (can be refactored to config later)
const BUILDING_MAX_LEVELS: Record<TownBuilding, number> = {
  Market: 5,
  Merchant: 5,
  Blacksmith: 5,
  Academy: 5,
};

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

  // Add computed property for max level check
  public isMaxLevel = computed(() => {
    const currentLevel = getBuildingLevel(this.building());
    const maxLevel = BUILDING_MAX_LEVELS[this.building() as TownBuilding];
    return currentLevel >= maxLevel;
  });

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

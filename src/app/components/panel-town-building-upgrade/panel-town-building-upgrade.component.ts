import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconItemComponent } from '@components/icon-currency/icon-currency.component';
import { IconLocationComponent } from '@components/icon-location/icon-location.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import {
  academyMaxEnchantLevel,
  alchemistCurrencyMultiplier,
  alchemistSkillsMax,
  blacksmithMaxEnchantLevel,
  currencyHasAmount,
  gamestate,
  marketCurrencyBonus,
  merchantMaxItemLevel,
  merchantMaxItems,
  merchantTraitChance,
  salvagerCurrencyMultiplier,
  salvagerItemsMax,
  townBuildingLevel,
  townBuildingMaxLevel,
  townBuildingUpgradeCost,
  townCanUpgradeBuildingLevel,
  townUpgradeBuildingLevel,
  worldNodeHasClaimedCount,
} from '@helpers';
import type { GameCurrency, LocationType, TownBuilding } from '@interfaces';

@Component({
  selector: 'app-panel-town-building-upgrade',
  imports: [
    IconLocationComponent,
    IconItemComponent,
    DecimalPipe,
    AnalyticsClickDirective,
  ],
  templateUrl: './panel-town-building-upgrade.component.html',
  styleUrl: './panel-town-building-upgrade.component.scss',
})
export class PanelTownBuildingUpgradeComponent {
  public building = input.required<TownBuilding>();

  public description = computed(() => {
    const upgradeReasons: Record<TownBuilding, string> = {
      Academy: `Academy can enchant items up to Lv.${academyMaxEnchantLevel()}.`,
      Alchemist: `Alchemist can salvage up to ${alchemistSkillsMax()} skills simultaneously. Skills salvage for ${alchemistCurrencyMultiplier()}x value.`,
      Blacksmith: `Blacksmith can enchant items up to Lv.${blacksmithMaxEnchantLevel()}.`,
      Market: `Market gives ${Math.floor(marketCurrencyBonus() * 100)}% more currency per exchange.`,
      Merchant: `Merchant has ${merchantMaxItems()} items for sale. Items can be up to level ${merchantMaxItemLevel()}. Items have a ${merchantTraitChance()}% chance to have a special trait.`,
      Salvager: `Salvager can salvage up to ${salvagerItemsMax()} items simultaneously. Items salvage for ${salvagerCurrencyMultiplier()}x value.`,
    };

    return upgradeReasons[this.building()];
  });

  public nextLevel = computed(() => townBuildingLevel(this.building()) + 1);

  public canUpgrade = computed(() =>
    townCanUpgradeBuildingLevel(this.building()),
  );
  public upgradeRequirements = computed(() =>
    townBuildingUpgradeCost(this.building()),
  );

  public isMaxLevel = computed(
    () =>
      townBuildingMaxLevel(this.building()) <=
      townBuildingLevel(this.building()),
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
    return worldNodeHasClaimedCount(type, num);
  }

  public hasCurrency(type: GameCurrency, num: number) {
    return currencyHasAmount(type, num);
  }

  public upgrade() {
    townUpgradeBuildingLevel(this.building());
  }
}

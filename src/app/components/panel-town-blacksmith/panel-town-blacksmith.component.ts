import { Component, computed, signal } from '@angular/core';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { ButtonCostListComponent } from '@components/button-cost-list/button-cost-list.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { MarkerCurrencyInlineComponent } from '@components/marker-currency-inline/marker-currency-inline.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import { StatsItemComponent } from '@components/stats-item/stats-item.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import {
  currencyHasAmount,
  currencyHasMultipleAmounts,
} from '@helpers/currency';
import { itemGetById } from '@helpers/item';
import {
  symmetryCanIncreaseCount,
  symmetryItemsMatchingItem,
} from '@helpers/symmetry';
import {
  blacksmithCanEnchantItem,
  blacksmithEnchantItem,
  blacksmithIncreaseSymmetry,
  blacksmithNextItemEnchants,
  blacksmithRerollItemTrait,
  blacksmithRerollItemTraitCost,
} from '@helpers/town-blacksmith';
import type { GameCurrency } from '@interfaces/content-currency';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { BlacksmithEnchant } from '@interfaces/town';
import { TeleportDirective } from '@ngneat/overview';
import { debounce } from 'typescript-debounce-decorator';

@Component({
  selector: 'app-panel-town-blacksmith',
  imports: [
    PanelTownBuildingUpgradeComponent,
    CardPageComponent,
    TeleportDirective,
    InventoryGridContainerComponent,
    StatsItemComponent,
    BlankSlateComponent,
    MarkerCurrencyInlineComponent,
    AnalyticsClickDirective,
    ButtonCostListComponent,
  ],
  templateUrl: './panel-town-blacksmith.component.html',
  styleUrl: './panel-town-blacksmith.component.scss',
})
export class PanelTownBlacksmithComponent {
  public selectedItem = signal<EquipmentItem | undefined>(undefined);

  public enchantPaths = computed(() => {
    const item = this.selectedItem();
    if (!item) return [];

    return blacksmithNextItemEnchants(item).map((path) => ({
      path,
      costs: Object.keys(path.cost).filter(
        (c) => path.cost[c as GameCurrency] > 0,
      ) as GameCurrency[],
      canEnchant:
        blacksmithCanEnchantItem(item) && currencyHasMultipleAmounts(path.cost),
    }));
  });

  public canRerollItemTrait = computed(() =>
    currencyHasAmount('Mana', this.traitRerollCost()),
  );

  public traitRerollCost = computed(() => {
    const item = this.selectedItem();
    if (!item) return 0;

    return blacksmithRerollItemTraitCost(item);
  });

  public symmetryItemCount = computed(() => {
    const item = this.selectedItem();
    if (!item) return 0;

    return symmetryItemsMatchingItem(item).length;
  });

  public canIncreaseSymmetry = computed(() => {
    const item = this.selectedItem();
    if (!item) return false;

    return this.symmetryItemCount() > 0 && symmetryCanIncreaseCount(item);
  });

  private reselectItemFromState(item: EquipmentItem) {
    setTimeout(() => {
      this.selectedItem.set(itemGetById(item.id));
    }, 0);
  }

  @debounce(10)
  public enchantItem(item: EquipmentItem, enchant: BlacksmithEnchant) {
    blacksmithEnchantItem(item, enchant);
    this.reselectItemFromState(item);
  }

  @debounce(10)
  public rerollTrait(item: EquipmentItem) {
    blacksmithRerollItemTrait(item);
    this.reselectItemFromState(item);
  }

  @debounce(10)
  public increaseSymmetry(item: EquipmentItem) {
    blacksmithIncreaseSymmetry(item);
    this.reselectItemFromState(item);
  }
}

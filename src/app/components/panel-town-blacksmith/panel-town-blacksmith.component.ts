import { Component, computed, signal } from '@angular/core';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { MarkerCurrencyInlineComponent } from '@components/marker-currency-inline/marker-currency-inline.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import { StatsItemComponent } from '@components/stats-item/stats-item.component';
import { hasCurrencies, hasCurrency } from '@helpers/currency';
import { getItemById } from '@helpers/item';
import {
  blacksmithCanEnchantItem,
  blacksmithEnchantItem,
  blacksmithNextItemEnchants,
  blacksmithRerollItemTrait,
  blacksmithRerollItemTraitCost,
} from '@helpers/town-blacksmith';
import type { GameCurrency } from '@interfaces/content-currency';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { BlacksmithEnchant } from '@interfaces/town';
import { TeleportDirective } from '@ngneat/overview';

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
      canEnchant: blacksmithCanEnchantItem(item) && hasCurrencies(path.cost),
    }));
  });

  public canRerollItemTrait = computed(() =>
    hasCurrency('Mana', this.traitRerollCost()),
  );

  public traitRerollCost = computed(() => {
    const item = this.selectedItem();
    if (!item) return 0;

    return blacksmithRerollItemTraitCost(item);
  });

  public enchantItem(item: EquipmentItem, enchant: BlacksmithEnchant) {
    blacksmithEnchantItem(item, enchant);

    this.selectedItem.set(getItemById(item.id));
  }

  public rerollTrait(item: EquipmentItem) {
    blacksmithRerollItemTrait(item);

    this.selectedItem.set(getItemById(item.id));
  }
}

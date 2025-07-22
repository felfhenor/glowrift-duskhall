import { Component, computed, signal } from '@angular/core';
import { TeleportDirective } from '@ngneat/overview';
import { RepeatPipe } from 'ngxtension/repeat-pipe';
import {
  gamestate,
  maxBlacksmithItems,
  multiItemSalvageCurrencyGain,
  notifySuccess,
  salvageItems,
  sortedRarityList,
} from '@helpers';
import type { EquipmentItem, GameCurrency } from '@interfaces';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconItemComponent } from '@components/icon-item/icon-item.component';
import { InventoryGridItemComponent } from '@components/inventory-grid-item/inventory-grid-item.component';
import { MarkerCurrencyComponent } from '@components/marker-currency/marker-currency.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';

@Component({
  selector: 'app-panel-town-salvager',
  imports: [
    PanelTownBuildingUpgradeComponent,
    CardPageComponent,
    InventoryGridItemComponent,
    IconBlankSlotComponent,
    IconItemComponent,
    RepeatPipe,
    BlankSlateComponent,
    MarkerCurrencyComponent,
    TeleportDirective,
  ],
  templateUrl: './panel-town-salvager.component.html',
  styleUrl: './panel-town-salvager.component.css',
})
export class PanelTownSalvagerComponent {
  public selectedItems = signal<EquipmentItem[]>([]);

  public visibleItemsToBreakDown = computed(() =>
    sortedRarityList(
      gamestate().inventory.items.filter(
        (i) => !this.selectedItems().includes(i),
      ),
    ),
  );

  public maxSlots = computed(() => maxBlacksmithItems());

  public hasAnyItems = computed(
    () => this.selectedItems().filter(Boolean).length > 0,
  );

  public earnings = computed(
    () =>
      Object.entries(multiItemSalvageCurrencyGain(this.selectedItems())) as [
        GameCurrency,
        number,
      ][],
  );

  chooseItem(item: EquipmentItem) {
    if (this.selectedItems().length >= this.maxSlots()) return;

    this.selectedItems.update((items) => [...items, item]);
  }

  unchooseItem(index: number) {
    this.selectedItems.update((items) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      return newItems;
    });
  }

  breakItems() {
    salvageItems(this.selectedItems());
    notifySuccess(`You salvaged ${this.selectedItems().length} items!`);

    this.selectedItems.set([]);
  }
}

import { Component, computed, signal } from '@angular/core';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconItemComponent } from '@components/icon-item/icon-item.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { MarkerCurrencyComponent } from '@components/marker-currency/marker-currency.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import { SFXDirective } from '@directives/sfx.directive';
import {
  analyticsSendDesignEvent,
  droppableSortedRarityList,
  notifySuccess,
  salvagerItemsMax,
  salvagerMultiItemSalvageCurrencyGain,
  salvagerSalvageItems,
} from '@helpers';
import { gamestate } from '@helpers/state-game';
import type { EquipmentItem, GameCurrency } from '@interfaces';
import { TeleportDirective } from '@ngneat/overview';
import { RepeatPipe } from 'ngxtension/repeat-pipe';

@Component({
  selector: 'app-panel-town-salvager',
  imports: [
    PanelTownBuildingUpgradeComponent,
    CardPageComponent,
    IconBlankSlotComponent,
    IconItemComponent,
    RepeatPipe,
    BlankSlateComponent,
    MarkerCurrencyComponent,
    TeleportDirective,
    InventoryGridContainerComponent,
    SFXDirective,
  ],
  templateUrl: './panel-town-salvager.component.html',
  styleUrl: './panel-town-salvager.component.scss',
})
export class PanelTownSalvagerComponent {
  public selectedItems = signal<EquipmentItem[]>([]);

  public disabledItemIds = computed(() =>
    this.selectedItems().map((i) => i.id),
  );

  public maxSlots = computed(() => salvagerItemsMax());

  public hasAnyItems = computed(
    () => this.selectedItems().filter(Boolean).length > 0,
  );

  public earnings = computed(
    () =>
      Object.entries(
        salvagerMultiItemSalvageCurrencyGain(this.selectedItems()),
      ) as [GameCurrency, number][],
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
    this.selectedItems().forEach((item) =>
      analyticsSendDesignEvent(`Game:Town:Salvager:Break:${item.name}`),
    );

    salvagerSalvageItems(this.selectedItems());
    notifySuccess(`You salvaged ${this.selectedItems().length} items!`);

    this.selectedItems.set([]);
  }

  autoChooseItems() {
    const availableSlots = this.maxSlots() - this.selectedItems().length;
    if (availableSlots <= 0) return;

    // Get all equipment items, sorted by rarity/level, excluding favorited items
    const allItems = droppableSortedRarityList<EquipmentItem>(
      gamestate().inventory.items.filter(
        (item) =>
          ['accessory', 'armor', 'trinket', 'weapon'].includes(item.__type) &&
          !this.disabledItemIds().includes(item.id) &&
          !item.isFavorite,
      ),
    );

    // Take the worst items (last in the sorted list)
    const worstItems = allItems.slice(-availableSlots);

    // Add them to selected items
    this.selectedItems.update((items) => [...items, ...worstItems]);
  }
}

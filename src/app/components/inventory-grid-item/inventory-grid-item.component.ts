import { Component, computed, input, output } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconItemComponent } from '@components/icon-item/icon-item.component';
import {
  allHeroes,
  equipItem,
  itemSalvage,
  itemSalvageValue,
  toggleItemFavorite,
} from '@helpers';
import type {
  EquipmentItem,
  EquipmentItemId,
  EquipmentSlot,
  Hero,
  ItemAction,
} from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-inventory-grid-item',
  imports: [
    IconItemComponent,
    TippyDirective,
    DecimalPipe,
    IconBlankSlotComponent,
  ],
  templateUrl: './inventory-grid-item.component.html',
  styleUrl: './inventory-grid-item.component.scss',
})
export class InventoryGridItemComponent {
  public items = input.required<(EquipmentItem | undefined)[]>();
  public disabledItemIds = input<EquipmentItemId[]>([]);
  public clickableItems = input<boolean>();
  public allowedActions = input<ItemAction[]>([]);
  public compareWithEquippedHero = input<Hero>();
  public isShopList = input<boolean>(false);

  public itemClicked = output<EquipmentItem>();

  public allHeroes = computed(() => allHeroes());

  salvageValue(item: EquipmentItem) {
    return itemSalvageValue(item);
  }

  salvageItem(item: EquipmentItem) {
    itemSalvage(item);
  }

  toggleFavorite(item: EquipmentItem) {
    toggleItemFavorite(item);
  }

  compareWithItem(item: EquipmentItem) {
    return this.compareWithEquippedHero()?.equipment[item.__type];
  }

  heroEquippedItem(
    hero: Hero,
    itemSlot: EquipmentSlot,
  ): EquipmentItem | undefined {
    return hero.equipment[itemSlot];
  }

  equipItem(item: EquipmentItem, hero: Hero) {
    equipItem(hero, item);
  }
}

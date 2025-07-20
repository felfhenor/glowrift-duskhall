import { Component, input, output } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { TippyDirective } from '@ngneat/helipopper';
import { itemSalvage, itemSalvageValue } from '@helpers';
import type { EquipmentItem, Hero } from '@interfaces';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconItemComponent } from '@components/icon-item/icon-item.component';

export type ItemAction = 'Salvage';

@Component({
  selector: 'app-inventory-grid-item',
  imports: [
    IconItemComponent,
    TippyDirective,
    DecimalPipe,
    IconBlankSlotComponent,
  ],
  templateUrl: './inventory-grid-item.component.html',
  styleUrl: './inventory-grid-item.component.css',
})
export class InventoryGridItemComponent {
  public items = input.required<(EquipmentItem | undefined)[]>();
  public clickableItems = input<boolean>();
  public allowedActions = input<ItemAction[]>([]);
  public compareWithEquippedHero = input<Hero>();
  public isShopList = input<boolean>(false);

  public itemClicked = output<EquipmentItem>();

  salvageValue(item: EquipmentItem) {
    return itemSalvageValue(item);
  }

  salvageItem(item: EquipmentItem) {
    itemSalvage(item);
  }

  compareWithItem(item: EquipmentItem) {
    return this.compareWithEquippedHero()?.equipment[item.__type];
  }
}

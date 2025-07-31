import { Component, signal } from '@angular/core';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { IconComponent } from '@components/icon/icon.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { getOption, setOption, showInventoryMenu } from '@helpers';
import type { InventorySlotType } from '@interfaces';

@Component({
  selector: 'app-panel-inventory',
  imports: [CardPageComponent, IconComponent, InventoryGridContainerComponent],
  templateUrl: './panel-inventory.component.html',
  styleUrl: './panel-inventory.component.scss',
})
export class PanelInventoryComponent {
  public currentItemType = signal(getOption('inventoryFilter'));

  closeMenu() {
    showInventoryMenu.set(false);
  }

  changeItemType(type: InventorySlotType | undefined) {
    if (!type) return;

    setOption('inventoryFilter', type);
  }
}

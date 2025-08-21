import { Component, signal } from '@angular/core';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { getOption, setOption, showInventoryMenu } from '@helpers';
import type { InventorySlotType } from '@interfaces';
import { ClickOutsideDirective } from '@directives/click-outside.directive';

@Component({
  selector: 'app-panel-inventory',
  imports: [
    CardPageComponent,
    InventoryGridContainerComponent,
    ButtonCloseComponent,
    ClickOutsideDirective,
  ],
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

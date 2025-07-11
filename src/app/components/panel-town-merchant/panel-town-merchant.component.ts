import { Component, computed, signal, viewChild } from '@angular/core';
import { SwalComponent, SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import {
  buyItem,
  gamestate,
  hasCurrency,
  itemBuyValue,
  notifyError,
} from '@helpers';
import { EquipmentItem } from '@interfaces';
import { CountdownComponent } from '@components/countdown/countdown.component';
import { InventoryGridItemComponent } from '@components/inventory-grid-item/inventory-grid-item.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';

@Component({
  selector: 'app-panel-town-merchant',
  imports: [
    PanelTownBuildingUpgradeComponent,
    CountdownComponent,
    InventoryGridItemComponent,
    SweetAlert2Module,
  ],
  templateUrl: './panel-town-merchant.component.html',
  styleUrl: './panel-town-merchant.component.scss',
})
export class PanelTownMerchantComponent {
  public shopResetTicks = computed(
    () => gamestate().town.merchant.ticksUntilRefresh,
  );
  public shopItems = computed(() => gamestate().town.merchant.soldItems);

  public purchasingItem = signal<EquipmentItem | undefined>(undefined);
  public purchaseCost = computed(() =>
    this.purchasingItem() ? itemBuyValue(this.purchasingItem()!) : 0,
  );

  public buySwal = viewChild<SwalComponent>('buySwal');

  public selectItem(item: EquipmentItem | undefined): void {
    this.purchasingItem.set(item);

    if (item) {
      setTimeout(() => {
        this.buySwal()?.fire();
      });
    }
  }

  public buyCurrentItem(): void {
    if (!this.purchasingItem()) return;
    if (!hasCurrency('Mana', this.purchaseCost())) {
      notifyError(`You do not have enough Mana to buy this item.`);
      return;
    }

    buyItem(this.shopItems().indexOf(this.purchasingItem()!));

    this.purchasingItem.set(undefined);
  }
}

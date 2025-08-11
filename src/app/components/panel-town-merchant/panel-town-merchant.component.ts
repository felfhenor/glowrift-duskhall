import { Component, computed, signal, viewChild } from '@angular/core';
import { CountdownComponent } from '@components/countdown/countdown.component';
import { InventoryGridItemComponent } from '@components/inventory-grid-item/inventory-grid-item.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import {
  actionItemBuyValue,
  currencyHasAmount,
  gamestate,
  merchantBuy,
  notifyError,
} from '@helpers';
import type { EquipmentItem } from '@interfaces';
import type { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

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
    this.purchasingItem() ? actionItemBuyValue(this.purchasingItem()!) : 0,
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
    if (!currencyHasAmount('Mana', this.purchaseCost())) {
      notifyError(`You do not have enough Mana to buy this item.`);
      return;
    }

    merchantBuy(this.shopItems().indexOf(this.purchasingItem()!));

    this.purchasingItem.set(undefined);
  }
}

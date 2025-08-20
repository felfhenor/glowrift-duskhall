import { Component, computed, input } from '@angular/core';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconComponent } from '@components/icon/icon.component';
import { StatsItemCompareComponent } from '@components/stats-item-compare/stats-item-compare.component';
import { StatsItemComponent } from '@components/stats-item/stats-item.component';
import { actionItemBuyValue, itemEnchantLevel } from '@helpers';
import { findEquippedItem, showContextMenuStats } from '@helpers/ui';
import type { EquipmentItem, EquipmentItemContent } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';
import { GameCurrencyPipe } from '@pipes/game-currency.pipe';

@Component({
  selector: 'app-icon-item',
  imports: [
    AtlasImageComponent,
    TippyDirective,
    StatsItemComponent,
    StatsItemCompareComponent,
    GameCurrencyPipe,
    IconBlankSlotComponent,
    IconComponent,
  ],
  templateUrl: './icon-item.component.html',
  styleUrl: './icon-item.component.scss',
})
export class IconItemComponent {
  public item = input.required<EquipmentItemContent>();
  public compareItem = input<EquipmentItemContent>();

  public itemEnchantLevel = computed(() =>
    itemEnchantLevel(this.item() as EquipmentItem),
  );

  public showLevel = input<boolean>(true);
  public showEnchantLevel = input<boolean>(true);
  public showPrice = input<boolean>(false);

  public shopPrice = computed(() => actionItemBuyValue(this.item()));

  public onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    
    const equippedData = findEquippedItem(this.item().id);
    if (!equippedData) {
      return; // Only show context menu for equipped items
    }

    // Find what item is currently in the same slot to compare with
    const currentItem = equippedData.hero.equipment[equippedData.slot];
    
    showContextMenuStats({
      x: event.clientX,
      y: event.clientY,
      itemData: this.item(),
      compareItem: currentItem !== this.item() ? currentItem : undefined,
    });
  }
}

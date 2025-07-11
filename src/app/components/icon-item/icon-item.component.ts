import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { itemBuyValue, rarityItemOutlineColor } from '@helpers';
import { EquipmentItemContent } from '@interfaces';
import { GameCurrencyPipe } from '@pipes/game-currency.pipe';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { StatsItemCompareComponent } from '@components/stats-item-compare/stats-item-compare.component';
import { StatsItemComponent } from '@components/stats-item/stats-item.component';

@Component({
  selector: 'app-icon-item',
  imports: [
    AtlasImageComponent,
    TippyDirective,
    StatsItemComponent,
    StatsItemCompareComponent,
    GameCurrencyPipe,
    IconBlankSlotComponent,
    NgClass,
  ],
  templateUrl: './icon-item.component.html',
  styleUrl: './icon-item.component.scss',
})
export class IconItemComponent {
  public item = input.required<EquipmentItemContent>();
  public compareItem = input<EquipmentItemContent>();

  public showLevel = input<boolean>(true);
  public showPrice = input<boolean>(false);

  public shopPrice = computed(() => itemBuyValue(this.item()));

  public itemOutlineClass = computed(
    () => `${rarityItemOutlineColor(this.item().rarity)}`,
  );
}

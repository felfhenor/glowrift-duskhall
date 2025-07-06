import { Component, computed, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { itemBuyValue } from '../../helpers';
import { EquipmentItemDefinition } from '../../interfaces';
import { GameCurrencyPipe } from '../../pipes/game-currency.pipe';
import { AtlasImageComponent } from '../atlas-image/atlas-image.component';
import { IconBlankSlotComponent } from '../icon-blank-slot/icon-blank-slot.component';
import { ItemStatsCompareComponent } from '../item-stats-compare/item-stats-compare.component';
import { ItemStatsComponent } from '../item-stats/item-stats.component';
import { RarityItemColor } from '../../helpers/rarity-item-color';

@Component({
  selector: 'app-icon-item',
  imports: [
    AtlasImageComponent,
    TippyDirective,
    ItemStatsComponent,
    ItemStatsCompareComponent,
    GameCurrencyPipe,
    IconBlankSlotComponent,
  ],
  templateUrl: './icon-item.component.html',
  styleUrl: './icon-item.component.scss',
})
export class IconItemComponent {
  public item = input.required<EquipmentItemDefinition>();
  public compareItem = input<EquipmentItemDefinition>();

  public showLevel = input<boolean>(true);
  public showPrice = input<boolean>(false);

  public shopPrice = computed(() => itemBuyValue(this.item()));

  public itemOutlineClass = computed(
    () =>
      `h-[64px] w-[64px] outline outline-2 z-0 absolute outline-${RarityItemColor(this.item().rarity)}`,
  );
}

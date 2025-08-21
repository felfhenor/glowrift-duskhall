import { Component, computed, input } from '@angular/core';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconComponent } from '@components/icon/icon.component';
import { MarkerSymmetryComponent } from '@components/marker-symmetry/marker-symmetry.component';
import { StatsItemCompareComponent } from '@components/stats-item-compare/stats-item-compare.component';
import { StatsItemComponent } from '@components/stats-item/stats-item.component';
import { actionItemBuyValue, itemEnchantLevel, symmetryLevel } from '@helpers';
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
    MarkerSymmetryComponent,
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
  public symmetryLevel = computed(() =>
    symmetryLevel(this.item() as EquipmentItem),
  );
}

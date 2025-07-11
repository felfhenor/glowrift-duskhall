import { TitleCasePipe } from '@angular/common';
import { Component, computed, input, output, Signal } from '@angular/core';
import { EquipmentItem, EquipmentSlot, Hero } from '@interfaces';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconItemComponent } from '@components/icon-item/icon-item.component';

@Component({
  selector: 'app-panel-heroes-equipment',
  imports: [IconItemComponent, TitleCasePipe, IconBlankSlotComponent],
  templateUrl: './panel-heroes-equipment.component.html',
  styleUrl: './panel-heroes-equipment.component.css',
})
export class PanelHeroesEquipmentComponent {
  public hero = input.required<Hero>();
  public highlightSlot = input<EquipmentSlot>();
  public slotClick = output<EquipmentSlot>();
  public slotRightClick = output<EquipmentSlot>();

  public items: Signal<
    Array<{ item: EquipmentItem | undefined; slot: EquipmentSlot }>
  > = computed(() => [
    { slot: 'weapon', item: this.hero().equipment.weapon },
    { slot: 'armor', item: this.hero().equipment.armor },
    { slot: 'accessory', item: this.hero().equipment.accessory },
    { slot: 'trinket', item: this.hero().equipment.trinket },
  ]);
}

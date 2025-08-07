import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { rarityItemOutlineColor, rarityItemTextColor } from '@helpers/item';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-marker-trait',
  imports: [NgClass, TippyDirective],
  templateUrl: './marker-trait.component.html',
  styleUrl: './marker-trait.component.scss',
})
export class MarkerTraitComponent {
  public trait = input.required<TraitEquipmentContent>();

  public classes = computed(() => {
    return [
      rarityItemOutlineColor(this.trait().rarity),
      rarityItemTextColor(this.trait().rarity),
    ];
  });
}

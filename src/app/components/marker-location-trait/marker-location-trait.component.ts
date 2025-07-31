import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { rarityItemOutlineColor, rarityItemTextColor } from '@helpers/item';
import type { TraitLocationContent } from '@interfaces/content-trait-location';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-marker-location-trait',
  imports: [NgClass, TippyDirective],
  templateUrl: './marker-location-trait.component.html',
  styleUrl: './marker-location-trait.component.scss',
})
export class MarkerLocationTraitComponent {
  public trait = input.required<TraitLocationContent>();

  public classes = computed(() => {
    return [
      rarityItemOutlineColor(this.trait().rarity),
      rarityItemTextColor(this.trait().rarity),
    ];
  });
}

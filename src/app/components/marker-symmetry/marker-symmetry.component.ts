import { Component, computed, input } from '@angular/core';
import type { DropRarity, SymmetryLevel } from '@interfaces/droppable';
import { RepeatPipe } from 'ngxtension/repeat-pipe';

@Component({
  selector: 'app-marker-symmetry',
  imports: [RepeatPipe],
  templateUrl: './marker-symmetry.component.html',
  styleUrl: './marker-symmetry.component.scss',
})
export class MarkerSymmetryComponent {
  public level = input.required<SymmetryLevel>();
  public orientation = input<'horizontal' | 'vertical'>('horizontal');

  public rarity = computed(() => {
    const rarityMap: Record<SymmetryLevel, DropRarity> = {
      0: 'Common',
      1: 'Common',
      2: 'Uncommon',
      3: 'Rare',
      4: 'Mystical',
      5: 'Legendary',
    };
    return rarityMap[this.level()] ?? '';
  });
}

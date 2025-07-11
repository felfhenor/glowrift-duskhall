import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { getItemStat, rarityItemTextColor } from '../../helpers';
import { EquipmentItemDefinition, StatBlock } from '../../interfaces';
import { MarkerStatComponent } from '../marker-stat/marker-stat.component';

@Component({
  selector: 'app-item-stats',
  imports: [MarkerStatComponent, NgClass],
  templateUrl: './item-stats.component.html',
  styleUrl: './item-stats.component.scss',
})
export class ItemStatsComponent {
  public item = input.required<EquipmentItemDefinition>();
  public statDeltas = input<StatBlock>();

  public itemRarityClass = computed(() =>
    rarityItemTextColor(this.item().rarity),
  );
  public itemAura = computed(() => getItemStat(this.item(), 'Aura'));
  public itemForce = computed(() => getItemStat(this.item(), 'Force'));
  public itemHealth = computed(() => getItemStat(this.item(), 'Health'));
  public itemSpeed = computed(() => getItemStat(this.item(), 'Speed'));
}

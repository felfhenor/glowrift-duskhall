import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { getItemStat, rarityItemTextColor } from '../../helpers';
import { EquipmentItemDefinition, StatBlock } from '../../interfaces';
import { MarkerStatComponent } from '../marker-stat/marker-stat.component';

@Component({
  selector: 'app-stats-item',
  imports: [MarkerStatComponent, NgClass],
  templateUrl: './stats-item.component.html',
  styleUrl: './stats-item.component.css',
})
export class StatsItemComponent {
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

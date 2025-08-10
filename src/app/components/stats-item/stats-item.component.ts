import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MarkerElementComponent } from '@components/marker-element/marker-element.component';
import { MarkerStatComponent } from '@components/marker-stat/marker-stat.component';
import { MarkerTraitComponent } from '@components/marker-trait/marker-trait.component';
import {
  getEntry,
  getItemElementMultiplier,
  getItemEnchantLevel,
  getItemSkills,
  getItemStat,
  getItemTalents,
  getItemTraits,
} from '@helpers';
import type { ElementBlock, GameElement, TalentContent } from '@interfaces';
import {
  type EquipmentItem,
  type EquipmentItemContent,
  type StatBlock,
} from '@interfaces';

@Component({
  selector: 'app-stats-item',
  imports: [
    MarkerStatComponent,
    NgClass,
    MarkerElementComponent,
    MarkerTraitComponent,
  ],
  templateUrl: './stats-item.component.html',
  styleUrl: './stats-item.component.scss',
})
export class StatsItemComponent {
  public item = input.required<EquipmentItemContent | EquipmentItem>();
  public statDeltas = input<StatBlock>();
  public elementDeltas = input<ElementBlock>();
  public allowHorizontalCollapseOfStatBlocks = input<boolean>(false);

  public enchantLevel = computed(() =>
    getItemEnchantLevel(this.item() as EquipmentItem),
  );

  public itemAura = computed(() => getItemStat(this.item(), 'Aura'));
  public itemForce = computed(() => getItemStat(this.item(), 'Force'));
  public itemHealth = computed(() => getItemStat(this.item(), 'Health'));
  public itemSpeed = computed(() => getItemStat(this.item(), 'Speed'));

  public itemTraits = computed(() =>
    getItemTraits(this.item() as EquipmentItem),
  );

  public hasStats = computed(
    () =>
      this.itemAura() ||
      this.itemForce() ||
      this.itemHealth() ||
      this.itemSpeed() ||
      Object.values(this.statDeltas() ?? {}).some(Boolean),
  );

  public talents = computed(() =>
    getItemTalents(this.item() as EquipmentItem).map((t) => ({
      ...t,
      name: getEntry<TalentContent>(t.talentId)?.name ?? t.talentId,
    })),
  );

  public skills = computed(() => getItemSkills(this.item() as EquipmentItem));

  public elementBoosts = computed(() =>
    (['Earth', 'Fire', 'Water', 'Air'] as GameElement[])
      .map((el) => ({
        element: el,
        multiplier: getItemElementMultiplier(this.item(), el),
      }))
      .filter((e) => e.multiplier !== 0),
  );
}

import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MarkerElementComponent } from '@components/marker-element/marker-element.component';
import { MarkerStatComponent } from '@components/marker-stat/marker-stat.component';
import { MarkerTraitComponent } from '@components/marker-trait/marker-trait.component';
import {
  getEntry,
  itemElementMultiplier,
  itemEnchantLevel,
  itemSkills,
  itemStat,
  itemTalents,
  itemTraits,
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
    itemEnchantLevel(this.item() as EquipmentItem),
  );

  public itemAura = computed(() => itemStat(this.item(), 'Aura'));
  public itemForce = computed(() => itemStat(this.item(), 'Force'));
  public itemHealth = computed(() => itemStat(this.item(), 'Health'));
  public itemSpeed = computed(() => itemStat(this.item(), 'Speed'));

  public itemTraits = computed(() => itemTraits(this.item() as EquipmentItem));

  public hasStats = computed(
    () =>
      this.itemAura() ||
      this.itemForce() ||
      this.itemHealth() ||
      this.itemSpeed() ||
      Object.values(this.statDeltas() ?? {}).some(Boolean),
  );

  public talents = computed(() =>
    itemTalents(this.item() as EquipmentItem).map((t) => ({
      ...t,
      name: getEntry<TalentContent>(t.talentId)?.name ?? t.talentId,
    })),
  );

  public skills = computed(() => itemSkills(this.item() as EquipmentItem));

  public elementBoosts = computed(() =>
    (['Earth', 'Fire', 'Water', 'Air'] as GameElement[])
      .map((el) => ({
        element: el,
        multiplier: itemElementMultiplier(this.item(), el),
      }))
      .filter((e) => e.multiplier !== 0),
  );
}

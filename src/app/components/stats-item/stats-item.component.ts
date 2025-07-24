import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MarkerElementComponent } from '@components/marker-element/marker-element.component';
import { MarkerStatComponent } from '@components/marker-stat/marker-stat.component';
import { MarkerTraitComponent } from '@components/marker-trait/marker-trait.component';
import {
  getEntry,
  getItemElementMultiplier,
  getItemStat,
  rarityItemTextColor,
} from '@helpers';
import type {
  ElementBlock,
  GameElement,
  TalentContent,
  TraitEquipmentContent,
} from '@interfaces';
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
  styleUrl: './stats-item.component.css',
})
export class StatsItemComponent {
  public item = input.required<EquipmentItemContent | EquipmentItem>();
  public statDeltas = input<StatBlock>();
  public elementDeltas = input<ElementBlock>();

  public itemRarityClass = computed(() =>
    rarityItemTextColor(this.item().rarity),
  );
  public itemAura = computed(() => getItemStat(this.item(), 'Aura'));
  public itemForce = computed(() => getItemStat(this.item(), 'Force'));
  public itemHealth = computed(() => getItemStat(this.item(), 'Health'));
  public itemSpeed = computed(() => getItemStat(this.item(), 'Speed'));

  public itemTraits = computed(() =>
    this.item().traitIds.map((t) => getEntry<TraitEquipmentContent>(t)!),
  );

  public hasStats = computed(
    () =>
      Object.values(this.item().baseStats).some(Boolean) ||
      Object.values(this.statDeltas() ?? {}).some(Boolean),
  );

  public talents = computed(() =>
    (this.item().talentBoosts ?? [])
      .concat((this.item() as EquipmentItem).mods?.talentBoosts ?? [])
      .map((t) => ({
        ...t,
        name: getEntry<TalentContent>(t.talentId)?.name ?? t.talentId,
      })),
  );

  public elementBoosts = computed(() =>
    (['Fire', 'Water', 'Earth', 'Air'] as GameElement[])
      .map((el) => ({
        element: el,
        multiplier: getItemElementMultiplier(this.item(), el),
      }))
      .filter((e) => e.multiplier !== 0),
  );
}

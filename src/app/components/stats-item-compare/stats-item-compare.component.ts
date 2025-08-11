import type { Signal } from '@angular/core';
import { Component, computed, input } from '@angular/core';
import { StatsItemComponent } from '@components/stats-item/stats-item.component';
import { itemElementMultiplier, itemStat } from '@helpers';
import type {
  ElementBlock,
  EquipmentItemContent,
  StatBlock,
} from '@interfaces';

@Component({
  selector: 'app-stats-item-compare',
  imports: [StatsItemComponent],
  templateUrl: './stats-item-compare.component.html',
  styleUrl: './stats-item-compare.component.scss',
})
export class StatsItemCompareComponent {
  public item = input.required<EquipmentItemContent>();
  public compareWith = input.required<EquipmentItemContent>();

  public itemAura = computed(() => itemStat(this.item(), 'Aura'));
  public itemForce = computed(() => itemStat(this.item(), 'Force'));
  public itemHealth = computed(() => itemStat(this.item(), 'Health'));
  public itemSpeed = computed(() => itemStat(this.item(), 'Speed'));

  public leftSideStatDeltas: Signal<StatBlock> = computed(() => ({
    Aura: this.itemAura() - itemStat(this.compareWith(), 'Aura'),
    Force: this.itemForce() - itemStat(this.compareWith(), 'Force'),
    Health: this.itemHealth() - itemStat(this.item(), 'Health'),
    Speed: this.itemSpeed() - itemStat(this.compareWith(), 'Speed'),
  }));

  public rightSideStatDeltas: Signal<StatBlock> = computed(() => ({
    Aura: itemStat(this.compareWith(), 'Aura') - this.itemAura(),
    Force: itemStat(this.compareWith(), 'Force') - this.itemForce(),
    Health: itemStat(this.compareWith(), 'Health') - this.itemHealth(),
    Speed: itemStat(this.compareWith(), 'Speed') - this.itemSpeed(),
  }));

  public leftSideElementDeltas: Signal<ElementBlock> = computed(() => {
    return {
      Air:
        itemElementMultiplier(this.item(), 'Air') -
        itemElementMultiplier(this.compareWith(), 'Air'),
      Earth:
        itemElementMultiplier(this.item(), 'Earth') -
        itemElementMultiplier(this.compareWith(), 'Earth'),
      Fire:
        itemElementMultiplier(this.item(), 'Fire') -
        itemElementMultiplier(this.compareWith(), 'Fire'),
      Water:
        itemElementMultiplier(this.item(), 'Water') -
        itemElementMultiplier(this.compareWith(), 'Water'),
    };
  });

  public rightSideElementDeltas: Signal<ElementBlock> = computed(() => {
    return {
      Air:
        itemElementMultiplier(this.compareWith(), 'Air') -
        itemElementMultiplier(this.item(), 'Air'),
      Earth:
        itemElementMultiplier(this.compareWith(), 'Earth') -
        itemElementMultiplier(this.item(), 'Earth'),
      Fire:
        itemElementMultiplier(this.compareWith(), 'Fire') -
        itemElementMultiplier(this.item(), 'Fire'),
      Water:
        itemElementMultiplier(this.compareWith(), 'Water') -
        itemElementMultiplier(this.item(), 'Water'),
    };
  });
}

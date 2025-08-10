import type { Signal } from '@angular/core';
import { Component, computed, input } from '@angular/core';
import { StatsItemComponent } from '@components/stats-item/stats-item.component';
import { getItemElementMultiplier, getItemStat } from '@helpers';
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

  public itemAura = computed(() => getItemStat(this.item(), 'Aura'));
  public itemForce = computed(() => getItemStat(this.item(), 'Force'));
  public itemHealth = computed(() => getItemStat(this.item(), 'Health'));
  public itemSpeed = computed(() => getItemStat(this.item(), 'Speed'));

  public leftSideStatDeltas: Signal<StatBlock> = computed(() => ({
    Aura: this.itemAura() - getItemStat(this.compareWith(), 'Aura'),
    Force: this.itemForce() - getItemStat(this.compareWith(), 'Force'),
    Health: this.itemHealth() - getItemStat(this.item(), 'Health'),
    Speed: this.itemSpeed() - getItemStat(this.compareWith(), 'Speed'),
  }));

  public rightSideStatDeltas: Signal<StatBlock> = computed(() => ({
    Aura: getItemStat(this.compareWith(), 'Aura') - this.itemAura(),
    Force: getItemStat(this.compareWith(), 'Force') - this.itemForce(),
    Health: getItemStat(this.compareWith(), 'Health') - this.itemHealth(),
    Speed: getItemStat(this.compareWith(), 'Speed') - this.itemSpeed(),
  }));

  public leftSideElementDeltas: Signal<ElementBlock> = computed(() => {
    return {
      Air:
        getItemElementMultiplier(this.item(), 'Air') -
        getItemElementMultiplier(this.compareWith(), 'Air'),
      Earth:
        getItemElementMultiplier(this.item(), 'Earth') -
        getItemElementMultiplier(this.compareWith(), 'Earth'),
      Fire:
        getItemElementMultiplier(this.item(), 'Fire') -
        getItemElementMultiplier(this.compareWith(), 'Fire'),
      Water:
        getItemElementMultiplier(this.item(), 'Water') -
        getItemElementMultiplier(this.compareWith(), 'Water'),
    };
  });

  public rightSideElementDeltas: Signal<ElementBlock> = computed(() => {
    return {
      Air:
        getItemElementMultiplier(this.compareWith(), 'Air') -
        getItemElementMultiplier(this.item(), 'Air'),
      Earth:
        getItemElementMultiplier(this.compareWith(), 'Earth') -
        getItemElementMultiplier(this.item(), 'Earth'),
      Fire:
        getItemElementMultiplier(this.compareWith(), 'Fire') -
        getItemElementMultiplier(this.item(), 'Fire'),
      Water:
        getItemElementMultiplier(this.compareWith(), 'Water') -
        getItemElementMultiplier(this.item(), 'Water'),
    };
  });
}

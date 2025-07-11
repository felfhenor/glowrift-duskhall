import { Component, computed, input, Signal } from '@angular/core';
import { getItemStat } from '../../helpers';
import { EquipmentItemContent, StatBlock } from '../../interfaces';
import { StatsItemComponent } from '../stats-item/stats-item.component';

@Component({
  selector: 'app-stats-item-compare',
  imports: [StatsItemComponent],
  templateUrl: './stats-item-compare.component.html',
  styleUrl: './stats-item-compare.component.css',
})
export class StatsItemCompareComponent {
  public item = input.required<EquipmentItemContent>();
  public compareWith = input.required<EquipmentItemContent>();

  public itemAura = computed(() => getItemStat(this.item(), 'Aura'));
  public itemForce = computed(() => getItemStat(this.item(), 'Force'));
  public itemHealth = computed(() => getItemStat(this.item(), 'Health'));
  public itemSpeed = computed(() => getItemStat(this.item(), 'Speed'));

  public leftSideDeltas: Signal<StatBlock> = computed(() => ({
    Aura: this.itemAura() - getItemStat(this.compareWith(), 'Aura'),
    Force: this.itemForce() - getItemStat(this.compareWith(), 'Force'),
    Health: this.itemHealth() - getItemStat(this.item(), 'Health'),
    Speed: this.itemSpeed() - getItemStat(this.compareWith(), 'Speed'),
  }));

  public rightSideDeltas: Signal<StatBlock> = computed(() => ({
    Aura: getItemStat(this.compareWith(), 'Aura') - this.itemAura(),
    Force: getItemStat(this.compareWith(), 'Force') - this.itemForce(),
    Health: getItemStat(this.compareWith(), 'Health') - this.itemHealth(),
    Speed: getItemStat(this.compareWith(), 'Speed') - this.itemSpeed(),
  }));
}

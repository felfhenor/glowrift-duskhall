import { TitleCasePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { IconHeroComponent } from '@components/icon-hero/icon-hero.component';
import { IconComponent } from '@components/icon/icon.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { PanelHeroesEquipmentComponent } from '@components/panel-heroes-equipment/panel-heroes-equipment.component';
import { PanelHeroesSkillsComponent } from '@components/panel-heroes-skills/panel-heroes-skills.component';
import { PanelHeroesStatsComponent } from '@components/panel-heroes-stats/panel-heroes-stats.component';
import { PanelHeroesTalentsComponent } from '@components/panel-heroes-talents/panel-heroes-talents.component';
import { PanelHeroesTargettingComponent } from '@components/panel-heroes-targetting/panel-heroes-targetting.component';
import {
  equipItem,
  equipSkill,
  gamestate,
  getOption,
  setOption,
  showHeroesMenu,
  unequipItem,
  unequipSkill,
} from '@helpers';
import type { EquipmentItem, EquipmentSkill, EquipmentSlot } from '@interfaces';

@Component({
  selector: 'app-panel-heroes',
  imports: [
    CardPageComponent,
    IconComponent,
    PanelHeroesStatsComponent,
    IconHeroComponent,
    PanelHeroesEquipmentComponent,
    TitleCasePipe,
    PanelHeroesSkillsComponent,
    PanelHeroesTalentsComponent,
    PanelHeroesTargettingComponent,
    InventoryGridContainerComponent,
  ],
  templateUrl: './panel-heroes.component.html',
  styleUrl: './panel-heroes.component.css',
})
export class PanelHeroesComponent {
  public allHeroes = computed(() => gamestate().hero.heroes);

  public activeHeroIndex = computed(() => getOption('selectedHeroIndex'));
  public activeHero = computed(() => this.allHeroes()[this.activeHeroIndex()]);

  public equipItemType = signal<EquipmentSlot | undefined>(undefined);

  public skillSlot = signal<number>(-1);

  closeMenu() {
    showHeroesMenu.set(false);
  }

  closeEquipment() {
    this.equipItemType.set(undefined);
  }

  closeSkills() {
    this.skillSlot.set(-1);
  }

  setHeroIndex(index: number) {
    setOption('selectedHeroIndex', index);
    this.equipItemType.set(undefined);
    this.skillSlot.set(-1);
  }

  setSkillSlot(slot: number) {
    this.equipItemType.set(undefined);
    if (slot === this.skillSlot()) {
      this.closeSkills();
      return;
    }

    this.skillSlot.set(slot);
  }

  equipSkill(item: EquipmentSkill) {
    equipSkill(this.activeHero(), item, this.skillSlot());
  }

  unequipSkill(slot: number) {
    const skill = this.activeHero().skills[slot];
    if (!skill) return;

    unequipSkill(this.activeHero(), skill, slot);
  }

  setEquipType(type: EquipmentSlot) {
    this.skillSlot.set(-1);
    if (type === this.equipItemType()) {
      this.closeEquipment();
      return;
    }

    this.equipItemType.set(type);
  }

  equipItem(item: EquipmentItem) {
    equipItem(this.activeHero(), item);
  }

  unequipItem(itemSlot: EquipmentSlot) {
    const item = this.activeHero().equipment[itemSlot];
    if (!item) return;

    unequipItem(this.activeHero(), item);
  }
}

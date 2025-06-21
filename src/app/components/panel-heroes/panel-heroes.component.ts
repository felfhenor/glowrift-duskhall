import { TitleCasePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  equipItem,
  equipSkill,
  gamestate,
  showHeroesMenu,
  sortedRarityList,
  unequipItem,
  unequipSkill,
} from '../../helpers';
import { EquipmentItem, EquipmentSkill, EquipmentSlot } from '../../interfaces';
import { CardPageComponent } from '../card-page/card-page.component';
import { IconHeroComponent } from '../icon-hero/icon-hero.component';
import { IconComponent } from '../icon/icon.component';
import { InventoryGridItemComponent } from '../inventory-grid-item/inventory-grid-item.component';
import { InventoryGridSkillComponent } from '../inventory-grid-skill/inventory-grid-skill.component';
import { PanelHeroesEquipmentComponent } from '../panel-heroes-equipment/panel-heroes-equipment.component';
import { PanelHeroesSkillsComponent } from '../panel-heroes-skills/panel-heroes-skills.component';
import { PanelHeroesStatsComponent } from '../panel-heroes-stats/panel-heroes-stats.component';

@Component({
  selector: 'app-panel-heroes',
  imports: [
    CardPageComponent,
    IconComponent,
    PanelHeroesStatsComponent,
    IconHeroComponent,
    PanelHeroesEquipmentComponent,
    InventoryGridItemComponent,
    TitleCasePipe,
    PanelHeroesSkillsComponent,
    InventoryGridSkillComponent,
  ],
  templateUrl: './panel-heroes.component.html',
  styleUrl: './panel-heroes.component.css',
})
export class PanelHeroesComponent {
  public allHeroes = computed(() => gamestate().hero.heroes);

  public activeHeroIndex = signal<number>(0);
  public activeHero = computed(() => this.allHeroes()[this.activeHeroIndex()]);

  public equipItemType = signal<EquipmentSlot | undefined>(undefined);
  public visibleItemsToEquip = computed(() =>
    sortedRarityList(
      gamestate().inventory.items.filter(
        (i) => i.__type === this.equipItemType(),
      ),
    ),
  );

  public visibleSkillsToEquip = computed(() =>
    sortedRarityList(gamestate().inventory.skills),
  );

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
    this.activeHeroIndex.set(index);
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

import { TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
} from '@angular/core';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { IconHeroComponent } from '@components/icon-hero/icon-hero.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { PanelHeroesEquipmentComponent } from '@components/panel-heroes-equipment/panel-heroes-equipment.component';
import { PanelHeroesSkillsComponent } from '@components/panel-heroes-skills/panel-heroes-skills.component';
import { PanelHeroesStatsComponent } from '@components/panel-heroes-stats/panel-heroes-stats.component';
import { PanelHeroesTalentsComponent } from '@components/panel-heroes-talents/panel-heroes-talents.component';
import { PanelHeroesTargettingComponent } from '@components/panel-heroes-targetting/panel-heroes-targetting.component';
import {
  gamestate,
  getOption,
  itemEquip,
  itemUnequip,
  setOption,
  showAnySubmenu,
  showHeroesMenu,
  skillEquip,
  skillUnequip,
} from '@helpers';
import type { EquipmentItem, EquipmentSkill, EquipmentSlot } from '@interfaces';

@Component({
  selector: 'app-panel-heroes',
  imports: [
    CardPageComponent,
    PanelHeroesStatsComponent,
    IconHeroComponent,
    PanelHeroesEquipmentComponent,
    TitleCasePipe,
    PanelHeroesSkillsComponent,
    PanelHeroesTalentsComponent,
    PanelHeroesTargettingComponent,
    InventoryGridContainerComponent,
    ButtonCloseComponent,
  ],
  templateUrl: './panel-heroes.component.html',
  styleUrl: './panel-heroes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelHeroesComponent {
  public allHeroes = computed(() => gamestate().hero.heroes);

  public showingSubMenu = computed(() => showAnySubmenu());
  public activeHeroIndex = computed(() => getOption('selectedHeroIndex'));
  public activeHero = computed(() => this.allHeroes()[this.activeHeroIndex()]);

  public equipItemType = signal<EquipmentSlot | undefined>(undefined);

  public skillSlot = signal<number>(-1);

  constructor() {
    effect(() => {
      const isShowingSubMenu = this.showingSubMenu();
      if (!isShowingSubMenu) {
        this.closeEquipment();
        this.closeSkills();
      }
    });
  }

  closeMenu() {
    showHeroesMenu.set(false);
    showAnySubmenu.set(false);
  }

  closeEquipment() {
    this.equipItemType.set(undefined);
    showAnySubmenu.set(false);
  }

  closeSkills() {
    this.skillSlot.set(-1);
    showAnySubmenu.set(false);
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
    showAnySubmenu.set(true);
  }

  equipSkill(item: EquipmentSkill) {
    skillEquip(this.activeHero(), item, this.skillSlot());
    this.closeSkills();
  }

  unequipSkill(slot: number) {
    const skill = this.activeHero().skills[slot];
    if (!skill) return;

    skillUnequip(this.activeHero(), skill, slot);
  }

  setEquipType(type: EquipmentSlot) {
    this.skillSlot.set(-1);
    if (type === this.equipItemType()) {
      this.closeEquipment();
      return;
    }

    this.equipItemType.set(type);
    showAnySubmenu.set(true);
  }

  equipItem(item: EquipmentItem) {
    itemEquip(this.activeHero(), item);
    this.closeEquipment();
  }

  unequipItem(itemSlot: EquipmentSlot) {
    const item = this.activeHero().equipment[itemSlot];
    if (!item) return;

    itemUnequip(this.activeHero(), item);
  }
}

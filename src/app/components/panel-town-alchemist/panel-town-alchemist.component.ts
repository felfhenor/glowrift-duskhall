import { Component, computed, signal } from '@angular/core';
import { TeleportDirective } from '@ngneat/overview';
import { RepeatPipe } from 'ngxtension/repeat-pipe';
import {
  gamestate,
  maxAlchemistSkills,
  multiSkillSalvageCurrencyGain,
  notifySuccess,
  salvageSkills,
  sortedRarityList,
} from '@helpers';
import { EquipmentSkill, GameCurrency } from '@interfaces';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';
import { InventoryGridSkillComponent } from '@components/inventory-grid-skill/inventory-grid-skill.component';
import { MarkerCurrencyComponent } from '@components/marker-currency/marker-currency.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';

@Component({
  selector: 'app-panel-town-alchemist',
  imports: [
    PanelTownBuildingUpgradeComponent,
    CardPageComponent,
    IconBlankSlotComponent,
    RepeatPipe,
    BlankSlateComponent,
    MarkerCurrencyComponent,
    TeleportDirective,
    InventoryGridSkillComponent,
    IconSkillComponent,
  ],
  templateUrl: './panel-town-alchemist.component.html',
  styleUrl: './panel-town-alchemist.component.css',
})
export class PanelTownAlchemistComponent {
  public selectedItems = signal<EquipmentSkill[]>([]);

  public visibleSpellsToBreakDown = computed(() =>
    sortedRarityList(
      gamestate().inventory.skills.filter(
        (i) => !this.selectedItems().includes(i),
      ),
    ),
  );

  public maxSlots = computed(() => maxAlchemistSkills());

  public hasAnyItems = computed(
    () => this.selectedItems().filter(Boolean).length > 0,
  );

  public earnings = computed(
    () =>
      Object.entries(multiSkillSalvageCurrencyGain(this.selectedItems())) as [
        GameCurrency,
        number,
      ][],
  );

  chooseItem(item: EquipmentSkill) {
    if (this.selectedItems().length >= this.maxSlots()) return;

    this.selectedItems.update((items) => [...items, item]);
  }

  unchooseItem(index: number) {
    this.selectedItems.update((items) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      return newItems;
    });
  }

  breakItems() {
    salvageSkills(this.selectedItems());
    notifySuccess(`You salvaged ${this.selectedItems().length} spells!`);

    this.selectedItems.set([]);
  }
}

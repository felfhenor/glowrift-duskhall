import { Component, computed, signal } from '@angular/core';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { MarkerCurrencyComponent } from '@components/marker-currency/marker-currency.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import {
  maxAlchemistSkills,
  multiSkillSalvageCurrencyGain,
  notifySuccess,
  salvageSkills,
} from '@helpers';
import type { EquipmentSkill, GameCurrency } from '@interfaces';
import { TeleportDirective } from '@ngneat/overview';
import { RepeatPipe } from 'ngxtension/repeat-pipe';

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
    IconSkillComponent,
    InventoryGridContainerComponent,
  ],
  templateUrl: './panel-town-alchemist.component.html',
  styleUrl: './panel-town-alchemist.component.css',
})
export class PanelTownAlchemistComponent {
  public selectedSkills = signal<EquipmentSkill[]>([]);

  public disabledSkillIds = computed(() =>
    this.selectedSkills().map((i) => i.id),
  );

  public maxSlots = computed(() => maxAlchemistSkills());

  public hasAnyItems = computed(
    () => this.selectedSkills().filter(Boolean).length > 0,
  );

  public earnings = computed(
    () =>
      Object.entries(multiSkillSalvageCurrencyGain(this.selectedSkills())) as [
        GameCurrency,
        number,
      ][],
  );

  chooseItem(item: EquipmentSkill) {
    if (this.selectedSkills().length >= this.maxSlots()) return;

    this.selectedSkills.update((items) => [...items, item]);
  }

  unchooseItem(index: number) {
    this.selectedSkills.update((items) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      return newItems;
    });
  }

  breakItems() {
    salvageSkills(this.selectedSkills());
    notifySuccess(`You salvaged ${this.selectedSkills().length} spells!`);

    this.selectedSkills.set([]);
  }
}

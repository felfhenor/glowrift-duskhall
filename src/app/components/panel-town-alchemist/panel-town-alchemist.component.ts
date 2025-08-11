import { Component, computed, signal } from '@angular/core';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { MarkerCurrencyComponent } from '@components/marker-currency/marker-currency.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import {
  alchemistMultiSkillSalvageCurrencyGain,
  alchemistSalvageSkills,
  alchemistSkillsMax,
  analyticsSendDesignEvent,
  droppableSortedRarityList,
  notifySuccess,
} from '@helpers';
import { gamestate } from '@helpers/state-game';
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
  styleUrl: './panel-town-alchemist.component.scss',
})
export class PanelTownAlchemistComponent {
  public selectedSkills = signal<EquipmentSkill[]>([]);

  public disabledSkillIds = computed(() =>
    this.selectedSkills().map((i) => i.id),
  );

  public maxSlots = computed(() => alchemistSkillsMax());

  public hasAnyItems = computed(
    () => this.selectedSkills().filter(Boolean).length > 0,
  );

  public earnings = computed(
    () =>
      Object.entries(
        alchemistMultiSkillSalvageCurrencyGain(this.selectedSkills()),
      ) as [GameCurrency, number][],
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
    this.selectedSkills().forEach((item) =>
      analyticsSendDesignEvent(`Game:Town:Alchemist:Break:${item.name}`),
    );

    alchemistSalvageSkills(this.selectedSkills());
    notifySuccess(`You salvaged ${this.selectedSkills().length} spells!`);

    this.selectedSkills.set([]);
  }

  autoChooseSkills() {
    const availableSlots = this.maxSlots() - this.selectedSkills().length;
    if (availableSlots <= 0) return;

    // Get all skills, sorted by rarity/level, excluding favorited skills
    const allSkills = droppableSortedRarityList<EquipmentSkill>(
      gamestate().inventory.skills.filter(
        (skill) =>
          !this.disabledSkillIds().includes(skill.id) && !skill.isFavorite,
      ),
    );

    // Take the worst skills (last in the sorted list)
    const worstSkills = allSkills.slice(-availableSlots);

    // Add them to selected skills
    this.selectedSkills.update((skills) => [...skills, ...worstSkills]);
  }
}

import { Component, computed, signal } from '@angular/core';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { MarkerCurrencyInlineComponent } from '@components/marker-currency-inline/marker-currency-inline.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import { StatsSkillComponent } from '@components/stats-skill/stats-skill.component';
import { hasCurrencies } from '@helpers/currency';
import { getSkillById } from '@helpers/skill';
import {
  academyCanEnchantSkill,
  academyEnchantSkill,
  academyNextSkillEnchants,
} from '@helpers/town-academy';
import type { GameCurrency } from '@interfaces/content-currency';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { AcademyEnchant } from '@interfaces/town';
import { TeleportDirective } from '@ngneat/overview';

@Component({
  selector: 'app-panel-town-academy',
  imports: [
    CardPageComponent,
    InventoryGridContainerComponent,
    BlankSlateComponent,
    PanelTownBuildingUpgradeComponent,
    StatsSkillComponent,
    TeleportDirective,
    MarkerCurrencyInlineComponent,
  ],
  templateUrl: './panel-town-academy.component.html',
  styleUrl: './panel-town-academy.component.scss',
})
export class PanelTownAcademyComponent {
  public selectedSkill = signal<EquipmentSkill | undefined>(undefined);

  public enchantPaths = computed(() => {
    const item = this.selectedSkill();
    if (!item) return [];

    return academyNextSkillEnchants(item).map((path) => ({
      path,
      costs: Object.keys(path.cost).filter(
        (c) => path.cost[c as GameCurrency] > 0,
      ) as GameCurrency[],
      canEnchant: academyCanEnchantSkill(item) && hasCurrencies(path.cost),
    }));
  });

  public enchantSkill(skill: EquipmentSkill, enchant: AcademyEnchant) {
    academyEnchantSkill(skill, enchant);

    this.selectedSkill.set(getSkillById(skill.id));
  }
}

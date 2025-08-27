import { Component, computed, signal } from '@angular/core';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { ButtonCostListComponent } from '@components/button-cost-list/button-cost-list.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { InventoryGridContainerComponent } from '@components/inventory-grid-container/inventory-grid-container.component';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import { StatsSkillComponent } from '@components/stats-skill/stats-skill.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { SFXDirective } from '@directives/sfx.directive';
import { currencyHasMultipleAmounts } from '@helpers/currency';
import { skillGetById } from '@helpers/skill';
import {
  symmetryCanIncreaseCount,
  symmetrySkillsMatchingSkill,
} from '@helpers/symmetry';
import {
  academyCanEnchantSkill,
  academyEnchantSkill,
  academyIncreaseSymmetry,
  academyNextSkillEnchants,
} from '@helpers/town-academy';
import type { GameCurrency } from '@interfaces/content-currency';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { AcademyEnchant } from '@interfaces/town';
import { TeleportDirective } from '@ngneat/overview';
import { debounce } from 'typescript-debounce-decorator';

@Component({
  selector: 'app-panel-town-academy',
  imports: [
    CardPageComponent,
    InventoryGridContainerComponent,
    BlankSlateComponent,
    PanelTownBuildingUpgradeComponent,
    StatsSkillComponent,
    TeleportDirective,
    AnalyticsClickDirective,
    SFXDirective,
    ButtonCostListComponent,
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
      canEnchant:
        academyCanEnchantSkill(item) && currencyHasMultipleAmounts(path.cost),
    }));
  });

  public symmetrySkillCount = computed(() => {
    const skill = this.selectedSkill();
    if (!skill) return 0;

    return symmetrySkillsMatchingSkill(skill).length;
  });

  public canIncreaseSymmetry = computed(() => {
    const skill = this.selectedSkill();
    if (!skill) return false;

    return this.symmetrySkillCount() > 0 && symmetryCanIncreaseCount(skill);
  });

  private reselectSkillFromState(skill: EquipmentSkill) {
    setTimeout(() => {
      this.selectedSkill.set(skillGetById(skill.id));
    }, 0);
  }

  @debounce(10)
  public enchantSkill(skill: EquipmentSkill, enchant: AcademyEnchant) {
    academyEnchantSkill(skill, enchant);
    this.reselectSkillFromState(skill);
  }

  @debounce(10)
  public increaseSymmetry(skill: EquipmentSkill) {
    academyIncreaseSymmetry(skill);
    this.reselectSkillFromState(skill);
  }
}

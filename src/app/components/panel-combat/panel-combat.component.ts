import { Component, computed } from '@angular/core';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { PanelCombatCombatlogComponent } from '@components/panel-combat-combatlog/panel-combat-combatlog.component';
import { PanelCombatPreferencesComponent } from '@components/panel-combat-preferences/panel-combat-preferences.component';
import { OptionsBaseComponent } from '@components/panel-options/option-base-page.component';

import { ButtonCloseComponent } from '@components/button-close/button-close.component';
import {
  combatHandleFlee,
  currentCombat,
  isCombatOver,
  options,
  showCombatMenu,
} from '@helpers';
import type { CombatTab } from '@interfaces';

@Component({
  selector: 'app-panel-combat',
  imports: [
    CardPageComponent,
    PanelCombatPreferencesComponent,
    PanelCombatCombatlogComponent,
    ButtonCloseComponent,
  ],
  templateUrl: './panel-combat.component.html',
  styleUrl: './panel-combat.component.scss',
})
export class PanelCombatComponent extends OptionsBaseComponent {
  public activeTab = computed(() => options()['combatTab']);

  public changeActiveTab(tab: CombatTab): void {
    this.setOption('combatTab', tab);
  }

  public readonly tabs: Array<{ name: string; link: CombatTab }> = [
    {
      name: 'Exploration Preferences',
      link: 'Preferences',
    },
    { name: 'Combat Log', link: 'CombatLog' },
  ];

  closeMenu() {
    showCombatMenu.set(false);
  }

  canFlee(): boolean {
    const combat = currentCombat();
    return !!combat && !isCombatOver(combat);
  }

  fleeFromCombat() {
    combatHandleFlee();
  }
}

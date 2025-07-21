import { Component, computed } from '@angular/core';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { IconComponent } from '@components/icon/icon.component';
import { PanelCombatClaimsComponent } from '@components/panel-combat-claims/panel-combat-claims.component';
import { PanelCombatCombatlogComponent } from '@components/panel-combat-combatlog/panel-combat-combatlog.component';
import { PanelCombatPreferencesComponent } from '@components/panel-combat-preferences/panel-combat-preferences.component';
import { OptionsBaseComponent } from '@components/panel-options/option-base-page.component';
import {
  options,
  showCombatMenu,
  handleCombatFlee,
  currentCombat,
  isCombatOver,
} from '@helpers';
import type { CombatTab, CombatTabLink } from '@interfaces';

@Component({
  selector: 'app-panel-combat',
  imports: [
    CardPageComponent,
    IconComponent,
    PanelCombatPreferencesComponent,
    PanelCombatCombatlogComponent,
    PanelCombatClaimsComponent,
  ],
  templateUrl: './panel-combat.component.html',
  styleUrl: './panel-combat.component.css',
})
export class PanelCombatComponent extends OptionsBaseComponent {
  public activeTab = computed(() => options()['combatTab']);

  public changeActiveTab(tab: CombatTab): void {
    this.setValueForOption('combatTab', tab);
  }

  public readonly tabs: CombatTabLink[] = [
    {
      name: 'Preferences',
      link: 'Preferences',
    },
    { name: 'Claims', link: 'Claims' },
    { name: 'Combat Log', link: 'CombatLog' },
  ];

  closeMenu() {
    showCombatMenu.set(false);
  }

  combatTabVisibility(): boolean {
    const combat = currentCombat();
    return !!combat && !isCombatOver(combat);
  }

  fleeFromCombat() {
    handleCombatFlee();
  }
}

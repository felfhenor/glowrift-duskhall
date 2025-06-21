import { Component, computed } from '@angular/core';
import { options, showCombatMenu } from '../../helpers';
import { CombatTab, CombatTabLink } from '../../interfaces';
import { CardPageComponent } from '../card-page/card-page.component';
import { IconComponent } from '../icon/icon.component';
import { PanelCombatClaimsComponent } from '../panel-combat-claims/panel-combat-claims.component';
import { PanelCombatCombatlogComponent } from '../panel-combat-combatlog/panel-combat-combatlog.component';
import { PanelCombatPreferencesComponent } from '../panel-combat-preferences/panel-combat-preferences.component';
import { OptionsBaseComponent } from '../panel-options/option-base-page.component';

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
}

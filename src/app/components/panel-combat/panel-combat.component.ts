import { Component, computed } from '@angular/core';
import { showCombatMenu } from '../../helpers';
import { CardPageComponent } from '../card-page/card-page.component';
import { IconComponent } from '../icon/icon.component';
import { PanelCombatClaimsComponent } from '../panel-combat-claims/panel-combat-claims.component';
import { PanelCombatCombatlogComponent } from '../panel-combat-combatlog/panel-combat-combatlog.component';
import { PanelCombatPreferencesComponent } from '../panel-combat-preferences/panel-combat-preferences.component';
import { options } from '../../helpers';
import { OptionsBaseComponent } from '../panel-options/option-base-page.component';
import { CombatTab, CombatTabLink } from '../../interfaces';

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
      link: 'preferences',
    },
    { name: 'Claims', link: 'claims' },
    { name: 'Combat Log', link: 'combatlog' },
  ];

  closeMenu() {
    showCombatMenu.set(false);
  }
}

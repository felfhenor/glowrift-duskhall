import { Component, computed } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { gamestate, setHeroRiskTolerance } from '@helpers';
import { HeroRiskTolerance } from '@interfaces';

@Component({
  selector: 'app-panel-combat-preferences',
  imports: [TippyDirective],
  templateUrl: './panel-combat-preferences.component.html',
  styleUrl: './panel-combat-preferences.component.scss',
})
export class PanelCombatPreferencesComponent {
  public currentRiskTolerance = computed(() => gamestate().hero.riskTolerance);

  changeRiskTolerance(risk: HeroRiskTolerance) {
    setHeroRiskTolerance(risk);
  }
}

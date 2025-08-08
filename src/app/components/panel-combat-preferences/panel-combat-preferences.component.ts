import { TitleCasePipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { IconLocationComponent } from '@components/icon-location/icon-location.component';
import {
  gamestate,
  setHeroRiskTolerance,
  setNodeTypePreference,
} from '@helpers';
import type { HeroRiskTolerance, LocationType } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-panel-combat-preferences',
  imports: [TippyDirective, TitleCasePipe, IconLocationComponent],
  templateUrl: './panel-combat-preferences.component.html',
  styleUrl: './panel-combat-preferences.component.scss',
})
export class PanelCombatPreferencesComponent {
  public currentRiskTolerance = computed(() => gamestate().hero.riskTolerance);
  public nodeTypePreferences = computed(
    () => gamestate().hero.nodeTypePreferences,
  );

  // Location types for template
  public readonly locationTypes: LocationType[] = [
    'cave',
    'town',
    'village',
    'dungeon',
    'castle',
  ];

  changeRiskTolerance(risk: HeroRiskTolerance) {
    setHeroRiskTolerance(risk);
  }

  toggleNodeType(nodeType: LocationType) {
    const current = this.nodeTypePreferences()[nodeType];
    setNodeTypePreference(nodeType, !current);
  }
}

import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { IconLocationComponent } from '@components/icon-location/icon-location.component';
import { SFXDirective } from '@directives/sfx.directive';
import {
  gamestate,
  heroSetLootRarityPreference,
  heroSetNodeTypePreference,
  heroSetRiskTolerance,
} from '@helpers';
import type { DropRarity, HeroRiskTolerance, LocationType } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-panel-combat-preferences',
  imports: [
    TippyDirective,
    TitleCasePipe,
    IconLocationComponent,
    NgClass,
    SFXDirective,
  ],
  templateUrl: './panel-combat-preferences.component.html',
  styleUrl: './panel-combat-preferences.component.scss',
})
export class PanelCombatPreferencesComponent {
  public currentRiskTolerance = computed(() => gamestate().hero.riskTolerance);
  public nodeTypePreferences = computed(
    () => gamestate().hero.nodeTypePreferences,
  );
  public lootRarityPreferences = computed(
    () => gamestate().hero.lootRarityPreferences,
  );

  // Location types for template
  public readonly locationTypes: LocationType[] = [
    'cave',
    'town',
    'village',
    'dungeon',
    'castle',
  ];

  // Loot rarities for template (excluding Unique which is special)
  public readonly lootRarities: DropRarity[] = [
    'Common',
    'Uncommon',
    'Rare',
    'Mystical',
    'Legendary',
  ];

  changeRiskTolerance(risk: HeroRiskTolerance) {
    heroSetRiskTolerance(risk);
  }

  toggleNodeType(nodeType: LocationType) {
    const current = this.nodeTypePreferences()[nodeType];
    heroSetNodeTypePreference(nodeType, !current);
  }

  toggleLootRarity(rarity: DropRarity) {
    const current = this.lootRarityPreferences()[rarity];
    heroSetLootRarityPreference(rarity, !current);
  }
}

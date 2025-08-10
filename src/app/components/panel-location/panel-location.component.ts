import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { CountdownComponent } from '@components/countdown/countdown.component';
import { IconItemComponent } from '@components/icon-currency/icon-currency.component';
import { IconElementComponent } from '@components/icon-element/icon-element.component';
import { IconComponent } from '@components/icon/icon.component';
import { LocationClaimProgressTextComponent } from '@components/location-claim-progress-text/location-claim-progress-text.component';
import { LocationGuardianDisplayComponent } from '@components/location-guardian-display/location-guardian-display.component';
import { LocationLootDisplayComponent } from '@components/location-loot-display/location-loot-display.component';
import { MarkerLocationClaimComponent } from '@components/marker-location-claim/marker-location-claim.component';
import { MarkerLocationTraitComponent } from '@components/marker-location-trait/marker-location-trait.component';
import {
  areAllHeroesDead,
  createGuardianForLocation,
  gamestate,
  getCurrencyClaimsForNode,
  getEntry,
  getSpriteFromNodeType,
  isAtNode,
  isTravelingToNode,
  showLocationMenu,
  totalTicksElapsed,
  travelTimeFromCurrentLocationTo,
  travelToNode,
} from '@helpers';
import type { TraitLocationContent } from '@interfaces';
import {
  type DroppableEquippable,
  type GameCurrency,
  type Guardian,
  type WorldLocation,
} from '@interfaces';
import { sortBy } from 'es-toolkit/compat';

@Component({
  selector: 'app-panel-location',
  imports: [
    CardPageComponent,
    IconComponent,
    MarkerLocationClaimComponent,
    AtlasImageComponent,
    TitleCasePipe,
    DecimalPipe,
    CountdownComponent,
    LocationClaimProgressTextComponent,
    LocationGuardianDisplayComponent,
    LocationLootDisplayComponent,
    IconItemComponent,
    IconElementComponent,
    MarkerLocationTraitComponent,
    ButtonCloseComponent,
  ],
  templateUrl: './panel-location.component.html',
  styleUrl: './panel-location.component.scss',
})
export class PanelLocationComponent {
  public location = input.required<WorldLocation>();

  public objectSprite = computed(() =>
    getSpriteFromNodeType(this.location().nodeType),
  );

  public traits = computed(() =>
    this.location()
      .traitIds.map((t) => getEntry<TraitLocationContent>(t)!)
      .filter(Boolean),
  );

  public travelTimeSeconds = computed(() => {
    if (this.isTravelingToThisNode()) {
      return gamestate().hero.travel.ticksLeft;
    }

    return travelTimeFromCurrentLocationTo(this.location());
  });

  public isTravelingToThisNode = computed(() =>
    isTravelingToNode(this.location()),
  );
  public travelTimeRemaining = computed(
    () => gamestate().hero.travel.ticksLeft,
  );
  public isAtThisNode = computed(() => isAtNode(this.location()));

  public canTravelToThisNode = computed(
    () =>
      !this.isAtThisNode() &&
      !this.isTravelingToThisNode() &&
      !areAllHeroesDead(),
  );

  public nodeLostTime = computed(
    () => this.location().unclaimTime - totalTicksElapsed(),
  );

  public elements = computed(() => sortBy(this.location().elements, 'element'));

  public guardians = computed(() =>
    this.location()
      .guardianIds.map((g) => getEntry<Guardian>(g)!)
      .map((g) => createGuardianForLocation(this.location(), g)),
  );
  public loot = computed(() =>
    this.location().claimLootIds.map((l) => getEntry<DroppableEquippable>(l)!),
  );

  public resourcesGenerated = computed(() => {
    const generated = getCurrencyClaimsForNode(this.location());
    return sortBy(
      Object.keys(generated)
        .map((resource) => ({
          resource: resource as GameCurrency,
          amount: generated[resource as GameCurrency],
        }))
        .filter((r) => r.amount > 0),
      'resource',
    );
  });

  closeMenu() {
    showLocationMenu.set(undefined);
  }

  travelToThisNode() {
    travelToNode(this.location());
  }
}

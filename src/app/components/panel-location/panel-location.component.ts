import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';
import { CardPageComponent } from '@components/card-page/card-page.component';
import { CountdownComponent } from '@components/countdown/countdown.component';
import { IconItemComponent } from '@components/icon-currency/icon-currency.component';
import { IconElementComponent } from '@components/icon-element/icon-element.component';
import { IconComponent } from '@components/icon/icon.component';
import { LocationGuardianDisplayComponent } from '@components/location-guardian-display/location-guardian-display.component';
import { LocationLootDisplayComponent } from '@components/location-loot-display/location-loot-display.component';
import { LocationUpgradeDisplayComponent } from '@components/location-upgrade-display/location-upgrade-display.component';
import { MarkerLocationClaimComponent } from '@components/marker-location-claim/marker-location-claim.component';
import { MarkerLocationTraitComponent } from '@components/marker-location-trait/marker-location-trait.component';
import {
  currencyClaimsGetForNode,
  gamestate,
  getEntry,
  guardianCreateForLocation,
  heroAreAllDead,
  isTravelingToNode,
  locationAvailableUpgrades,
  locationEncounterLevel,
  locationGet,
  locationLevel,
  locationLootLevel,
  locationMaxLevel,
  showLocationMenu,
  spriteGetFromNodeType,
  timerTicksElapsed,
  travelIsAtNode,
  travelTimeFromCurrentLocationTo,
  travelToNode,
} from '@helpers';
import type { TraitLocationContent } from '@interfaces';
import {
  type DroppableEquippable,
  type GameCurrency,
  type Guardian,
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
    LocationGuardianDisplayComponent,
    LocationLootDisplayComponent,
    IconItemComponent,
    IconElementComponent,
    MarkerLocationTraitComponent,
    ButtonCloseComponent,
    BlankSlateComponent,
    LocationUpgradeDisplayComponent,
  ],
  templateUrl: './panel-location.component.html',
  styleUrl: './panel-location.component.scss',
})
export class PanelLocationComponent {
  public location = computed(() => {
    const nodePosition = showLocationMenu();
    const worldCenter = gamestate().world.homeBase;

    if (!nodePosition) return locationGet(worldCenter.x, worldCenter.y);

    return locationGet(nodePosition?.x, nodePosition?.y);
  });

  public objectSprite = computed(() =>
    spriteGetFromNodeType(this.location().nodeType),
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

  public isAtThisNode = computed(() => travelIsAtNode(this.location()));

  public canTravelToThisNode = computed(
    () =>
      !this.isAtThisNode() &&
      !this.isTravelingToThisNode() &&
      !heroAreAllDead(),
  );

  public nodeLostTime = computed(
    () => this.location().unclaimTime - timerTicksElapsed(),
  );

  public elements = computed(() => sortBy(this.location().elements, 'element'));

  public guardians = computed(() =>
    this.location()
      .guardianIds.map((g) => getEntry<Guardian>(g)!)
      .map((g) => guardianCreateForLocation(this.location(), g)),
  );
  public loot = computed(() =>
    this.location().claimLootIds.map((l) => getEntry<DroppableEquippable>(l)!),
  );

  public resourcesGenerated = computed(() => {
    const generated = currencyClaimsGetForNode(this.location());
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

  public availableUpgrades = computed(() =>
    locationAvailableUpgrades(this.location()),
  );
  public upgradeLevel = computed(() => locationLevel(this.location()));
  public maxUpgradeLevel = computed(() => locationMaxLevel());
  public encounterLevel = computed(() =>
    locationEncounterLevel(this.location()),
  );
  public lootLevel = computed(() => locationLootLevel(this.location()));

  closeMenu() {
    showLocationMenu.set(undefined);
  }

  travelToThisNode() {
    travelToNode(this.location());
  }
}

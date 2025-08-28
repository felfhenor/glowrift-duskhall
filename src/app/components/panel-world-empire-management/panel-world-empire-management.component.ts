import { ScrollingModule } from '@angular/cdk/scrolling';
import { TitleCasePipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { IconLocationComponent } from '@components/icon-location/icon-location.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { SFXDirective } from '@directives/sfx.directive';
import { playSFX } from '@helpers/sfx';
import { getOption, setOption } from '@helpers/state-options';
import { showLocationMenu } from '@helpers/ui';
import { locationGetClaimed } from '@helpers/world-location';
import {
  locationAvailableUpgrades,
  locationCanUpgrade,
  locationEncounterLevel,
  locationLevel,
  locationLootLevel,
  locationUpgrade,
  locationUpgradeLevel,
} from '@helpers/world-location-upgrade';
import type { LocationUpgradeContent } from '@interfaces/content-locationupgrade';
import type { LocationType } from '@interfaces/content-worldconfig';
import type { OwnershipType } from '@interfaces/state-options';
import type { WorldLocation } from '@interfaces/world';
import { debounce } from 'typescript-debounce-decorator';

@Component({
  selector: 'app-panel-world-empire-management',
  imports: [
    AnalyticsClickDirective,
    IconLocationComponent,
    TitleCasePipe,
    ScrollingModule,
    SFXDirective,
  ],
  templateUrl: './panel-world-empire-management.component.html',
  styleUrl: './panel-world-empire-management.component.scss',
})
export class PanelWorldEmpireManagementComponent {
  public readonly locationTypes: LocationType[] = [
    'cave',
    'town',
    'village',
    'dungeon',
    'castle',
  ];

  public readonly ownershipTypes: Array<{
    type: OwnershipType;
    color: string;
  }> = [
    { type: 'Permanent', color: 'success' },
    { type: 'Temporary', color: 'warning' },
  ];

  public selectedLocationTypes = computed(() =>
    getOption('empireSelectedLocationTypes'),
  );

  public selectedOwnershipTypes = computed(() =>
    getOption('empireSelectedOwnershipTypes'),
  );

  private ownedLocations = computed(() =>
    locationGetClaimed()
      .filter((l) => this.selectedLocationTypes().includes(l.nodeType!))
      .filter((l) =>
        l.permanentlyClaimed
          ? this.selectedOwnershipTypes().includes('Permanent')
          : this.selectedOwnershipTypes().includes('Temporary'),
      )
      .map((l) => ({
        ...l,
        upgradeLevel: locationLevel(l),
        lootLevel: locationLootLevel(l),
        encounterLevel: locationEncounterLevel(l),
      })),
  );

  public formattedOwnedLocations = computed(() => {
    return this.ownedLocations().map((l) => ({
      ...l,
      type: l.nodeType as LocationType,
      upgrades: locationAvailableUpgrades(l).map((u) => ({
        ...u,
        canBuy: locationCanUpgrade(l, u),
        level: locationUpgradeLevel(l, u),
      })),
    }));
  });

  public trackLocBy(index: number, location: WorldLocation) {
    return location.id;
  }

  @debounce(10)
  public doUpgrade(location: WorldLocation, upgrade: LocationUpgradeContent) {
    locationUpgrade(location, upgrade);
    playSFX('ui-success', 0);
  }

  public openLocation(location: WorldLocation) {
    showLocationMenu.set(location);
  }

  public toggleLocationType(type: LocationType) {
    const current = this.selectedLocationTypes();
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];

    setOption('empireSelectedLocationTypes', next);
  }

  public toggleOwnershipType(type: OwnershipType) {
    const current = this.selectedOwnershipTypes();
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];

    setOption('empireSelectedOwnershipTypes', next);
  }
}

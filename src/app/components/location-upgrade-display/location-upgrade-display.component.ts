import { Component, computed, input } from '@angular/core';
import { ButtonCostListComponent } from '@components/button-cost-list/button-cost-list.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { currencyHasMultipleAmounts } from '@helpers/currency';
import {
  locationCanUpgrade,
  locationUpgrade,
  locationUpgradeCosts,
  locationUpgradeLevel,
} from '@helpers/world-location-upgrade';
import type {
  LocationUpgradeContent,
  LocationUpgradeContentNumerics,
} from '@interfaces/content-locationupgrade';
import type { WorldLocation } from '@interfaces/world';
import { sumBy } from 'es-toolkit/compat';
import { debounce } from 'typescript-debounce-decorator';

@Component({
  selector: 'app-location-upgrade-display',
  imports: [ButtonCostListComponent, AnalyticsClickDirective],
  templateUrl: './location-upgrade-display.component.html',
  styleUrl: './location-upgrade-display.component.scss',
})
export class LocationUpgradeDisplayComponent {
  public location = input.required<WorldLocation>();
  public upgrade = input.required<LocationUpgradeContent>();

  public totalUpgradeValue = computed(() => {
    return sumBy(
      Object.keys(this.upgrade()).filter((k) => k.includes('boost')),
      (k) => this.upgrade()[k as keyof LocationUpgradeContentNumerics],
    );
  });

  public description = computed(() =>
    this.upgrade().description.replace(
      '{value}',
      (
        this.totalUpgradeValue() *
        (1 + locationUpgradeLevel(this.location(), this.upgrade()))
      ).toString(),
    ),
  );

  public numPurchases = computed(() =>
    locationUpgradeLevel(this.location(), this.upgrade()),
  );

  public hasCurrency = computed(() =>
    currencyHasMultipleAmounts(this.upgradeCost()),
  );

  public canUpgrade = computed(() =>
    locationCanUpgrade(this.location(), this.upgrade()),
  );

  public upgradeCost = computed(() =>
    locationUpgradeCosts(this.location(), this.upgrade()),
  );

  @debounce(10)
  public buyUpgrade() {
    locationUpgrade(this.location(), this.upgrade());
  }
}

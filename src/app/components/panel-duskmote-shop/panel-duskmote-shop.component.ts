import { DecimalPipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import {
  bundleCanUnlock,
  bundleIsUnlocked,
  bundleUnlock,
} from '@helpers/bundle';
import { getEntriesByType } from '@helpers/content';
import { currencyGet } from '@helpers/currency';
import type { DuskmoteBundleContent } from '@interfaces/content-duskmotebundle';
import { sortBy } from 'es-toolkit/compat';

@Component({
  selector: 'app-panel-duskmote-shop',
  imports: [DecimalPipe],
  templateUrl: './panel-duskmote-shop.component.html',
  styleUrl: './panel-duskmote-shop.component.scss',
})
export class PanelDuskmoteShopComponent {
  public currentDuskmotes = computed(() => currencyGet('Duskmote'));

  public unboughtDuskmoteBundles = computed(() =>
    sortBy(
      getEntriesByType<DuskmoteBundleContent>('duskmotebundle').filter(
        (b) => !bundleIsUnlocked(b.id),
      ),
      (b) => b.cost,
    ).map((b) => ({
      ...b,
      canBuy: bundleCanUnlock(b),
    })),
  );

  public buyBundle(bundle: DuskmoteBundleContent) {
    if (!bundleCanUnlock(bundle)) return;

    bundleUnlock(bundle);
  }
}

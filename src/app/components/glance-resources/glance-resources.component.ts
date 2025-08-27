import { Component, computed, signal } from '@angular/core';
import { MarkerCurrencyCurrentComponent } from '@components/marker-currency-current/marker-currency-current.component';
import { MarkerCurrencyInlineComponent } from '@components/marker-currency-inline/marker-currency-inline.component';
import { gamestate } from '@helpers/state-game';
import type { GameCurrency } from '@interfaces/content-currency';

@Component({
  selector: 'app-glance-resources',
  imports: [MarkerCurrencyInlineComponent, MarkerCurrencyCurrentComponent],
  templateUrl: './glance-resources.component.html',
  styleUrl: './glance-resources.component.scss',
})
export class GlanceResourcesComponent {
  public showNames = signal<boolean>(false);

  public allCurrencies = computed(() => {
    const currencies = gamestate().currency.currencies;
    return Object.keys(currencies)
      .filter((c) => Math.floor(currencies[c as GameCurrency]) > 0)
      .map((c) => ({
        id: c as GameCurrency,
        amount: currencies[c as GameCurrency],
      }));
  });
}

import { Component, computed, input } from '@angular/core';
import { MarkerCurrencyInlineComponent } from '@components/marker-currency-inline/marker-currency-inline.component';
import type { CurrencyBlock, GameCurrency } from '@interfaces/content-currency';

@Component({
  selector: 'app-button-cost-list',
  imports: [MarkerCurrencyInlineComponent],
  templateUrl: './button-cost-list.component.html',
  styleUrl: './button-cost-list.component.scss',
})
export class ButtonCostListComponent {
  public label = input<string>();
  public currencies = input.required<CurrencyBlock>();

  public currencyList = computed(() => {
    return Object.entries(this.currencies())
      .map(([currency, value]) => {
        return { currency: currency as GameCurrency, value };
      })
      .filter(({ value }) => value > 0);
  });
}

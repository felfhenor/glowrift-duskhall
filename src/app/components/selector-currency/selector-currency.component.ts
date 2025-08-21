import { Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { getEntriesByType, currencySortByOrder } from '@helpers';
import type { CurrencyContent, GameCurrency } from '@interfaces';
import { IconItemComponent } from '@components/icon-currency/icon-currency.component';

@Component({
  selector: 'app-selector-currency',
  imports: [NgSelectModule, FormsModule, IconItemComponent],
  templateUrl: './selector-currency.component.html',
  styleUrl: './selector-currency.component.scss',
})
export class SelectorCurrencyComponent {
  public currency = model<CurrencyContent>();

  public allCurrencies = computed(() => {
    const currencies = getEntriesByType<CurrencyContent>('currency');
    const currencyNames = currencies.map(c => c.name as GameCurrency);
    const sortedNames = currencySortByOrder(currencyNames);
    
    return sortedNames.map(name => 
      currencies.find(c => c.name === name)!
    );
  });
}

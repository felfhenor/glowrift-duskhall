import { Component, computed, input } from '@angular/core';
import { MarkerCurrencyComponent } from '@components/marker-currency/marker-currency.component';
import { gamestate } from '@helpers';
import type { GameCurrency } from '@interfaces';

@Component({
  selector: 'app-marker-currency-current',
  imports: [MarkerCurrencyComponent],
  templateUrl: './marker-currency-current.component.html',
  styleUrl: './marker-currency-current.component.scss',
})
export class MarkerCurrencyCurrentComponent {
  public currency = input.required<GameCurrency>();

  public currentValue = computed(
    () => gamestate().currency.currencies[this.currency()] ?? 0,
  );
}

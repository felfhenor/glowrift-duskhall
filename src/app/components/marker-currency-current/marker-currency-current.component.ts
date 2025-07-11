import { Component, computed, input } from '@angular/core';
import { gamestate } from '@helpers';
import { GameCurrency } from '@interfaces';
import { MarkerCurrencyComponent } from '@components/marker-currency/marker-currency.component';

@Component({
  selector: 'app-marker-currency-current',
  imports: [MarkerCurrencyComponent],
  templateUrl: './marker-currency-current.component.html',
  styleUrl: './marker-currency-current.component.css',
})
export class MarkerCurrencyCurrentComponent {
  public currency = input.required<GameCurrency>();

  public currentValue = computed(
    () => gamestate().currency.currencies[this.currency()] ?? 0,
  );
}

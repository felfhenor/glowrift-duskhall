import { Component, input } from '@angular/core';
import { IconItemComponent } from '@components/icon-currency/icon-currency.component';
import type { GameCurrency } from '@interfaces';
import { GameCurrencyPipe } from '@pipes/game-currency.pipe';

@Component({
  selector: 'app-marker-currency-inline',
  imports: [GameCurrencyPipe, IconItemComponent],
  templateUrl: './marker-currency-inline.component.html',
  styleUrl: './marker-currency-inline.component.scss',
})
export class MarkerCurrencyInlineComponent {
  public currency = input.required<GameCurrency>();
  public value = input.required<number>();
}

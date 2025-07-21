import { TitleCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { GameCurrency } from '@interfaces';
import { GameCurrencyPipe } from '@pipes/game-currency.pipe';
import { IconItemComponent } from '@components/icon-currency/icon-currency.component';

@Component({
  selector: 'app-marker-currency',
  imports: [GameCurrencyPipe, TitleCasePipe, IconItemComponent],
  templateUrl: './marker-currency.component.html',
  styleUrl: './marker-currency.component.css',
})
export class MarkerCurrencyComponent {
  public currency = input.required<GameCurrency>();
  public value = input.required<number>();
}

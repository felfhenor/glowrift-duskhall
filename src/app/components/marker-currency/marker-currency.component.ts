import { TitleCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { IconItemComponent } from '@components/icon-currency/icon-currency.component';
import type { GameCurrency } from '@interfaces';
import { GameCurrencyPipe } from '@pipes/game-currency.pipe';

@Component({
  selector: 'app-marker-currency',
  imports: [GameCurrencyPipe, TitleCasePipe, IconItemComponent],
  templateUrl: './marker-currency.component.html',
  styleUrl: './marker-currency.component.scss',
})
export class MarkerCurrencyComponent {
  public currency = input.required<GameCurrency>();
  public value = input.required<number>();
}

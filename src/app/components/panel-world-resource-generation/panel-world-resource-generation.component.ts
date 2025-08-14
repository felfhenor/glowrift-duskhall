import { DecimalPipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { IconItemComponent } from '@components/icon-currency/icon-currency.component';
import { gamestate } from '@helpers/state-game';
import type { GameCurrency } from '@interfaces/content-currency';

@Component({
  selector: 'app-panel-world-resource-generation',
  imports: [IconItemComponent, DecimalPipe],
  templateUrl: './panel-world-resource-generation.component.html',
  styleUrl: './panel-world-resource-generation.component.scss',
})
export class PanelWorldResourceGenerationComponent {
  public claims = computed(() => {
    const earnings = gamestate().currency.currencyPerTickEarnings;

    return Object.keys(earnings)
      .map((currKey) => ({
        currency: currKey as GameCurrency,
        amount: earnings[currKey as GameCurrency],
      }))
      .filter((claim) => claim.amount > 0);
  });
}

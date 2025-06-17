import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  gainCurrency,
  hasCurrency,
  loseCurrency,
  notifySuccess,
} from '../../helpers';
import { Currency } from '../../interfaces';
import { PanelTownBuildingUpgradeComponent } from '../panel-town-building-upgrade/panel-town-building-upgrade.component';
import { SelectorCurrencyComponent } from '../selector-currency/selector-currency.component';

@Component({
  selector: 'app-panel-town-market',
  imports: [
    PanelTownBuildingUpgradeComponent,
    SelectorCurrencyComponent,
    FormsModule,
  ],
  templateUrl: './panel-town-market.component.html',
  styleUrl: './panel-town-market.component.scss',
})
export class PanelTownMarketComponent {
  public inputCurrency = signal<Currency | undefined>(undefined);
  public outputCurrency = signal<Currency | undefined>(undefined);

  public inputAmount = signal<number>(0);
  public outputAmount = signal<number>(0);

  public hasInputAmount = computed(() => {
    const input = this.inputCurrency();
    const amount = this.inputAmount();

    if (!input || amount < 0) return false;

    return hasCurrency(input.name, amount);
  });

  public canTrade = computed(() => {
    const input = this.inputCurrency();
    const output = this.outputCurrency();

    if (!input || !output || input.id === output.id || this.outputAmount() <= 0)
      return false;

    return this.hasInputAmount();
  });

  public inputAmountChanged() {
    const input = this.inputCurrency();
    const output = this.outputCurrency();

    if (!input || !output) return;

    this.inputAmount.set(Math.floor(this.inputAmount()));
    this.outputAmount.set(
      Math.floor((input.value / output.value) * this.inputAmount()),
    );
  }

  public outputAmountChanged() {
    const input = this.inputCurrency();
    const output = this.outputCurrency();

    if (!input || !output) return;

    this.outputAmount.set(Math.floor(this.outputAmount()));
    this.inputAmount.set(
      Math.floor(input.value * output.value * this.outputAmount()),
    );
  }

  public trade() {
    const input = this.inputCurrency();
    const output = this.outputCurrency();

    if (!input || !output) return;

    loseCurrency(input.name, this.inputAmount());
    gainCurrency(output.name, this.outputAmount());

    notifySuccess(
      `Traded ${this.inputAmount()} ${input.name} for ${this.outputAmount()} ${output.name}!`,
    );
  }
}

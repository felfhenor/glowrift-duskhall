import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PanelTownBuildingUpgradeComponent } from '@components/panel-town-building-upgrade/panel-town-building-upgrade.component';
import { SelectorCurrencyComponent } from '@components/selector-currency/selector-currency.component';
import {
  gainCurrency,
  hasCurrency,
  loseCurrency,
  notifySuccess,
  sendDesignEvent,
  townMarketBonus,
} from '@helpers';
import {
  calculateCurrencyConversionInputAmount,
  calculateCurrencyConversionOutputAmount,
} from '@helpers/currency-conversion';
import type { CurrencyContent } from '@interfaces';

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
  public inputCurrency = signal<CurrencyContent | undefined>(undefined);
  public outputCurrency = signal<CurrencyContent | undefined>(undefined);

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
      calculateCurrencyConversionOutputAmount(
        input,
        output,
        this.inputAmount(),
      ),
    );
  }

  public outputAmountChanged() {
    const input = this.inputCurrency();
    const output = this.outputCurrency();

    if (!input || !output) return;

    this.outputAmount.set(Math.floor(this.outputAmount()));
    this.inputAmount.set(
      calculateCurrencyConversionInputAmount(
        input,
        output,
        this.outputAmount(),
      ),
    );
  }

  public trade() {
    const input = this.inputCurrency();
    const output = this.outputCurrency();

    if (!input || !output) return;

    const outputBonusPercent = townMarketBonus();
    const outputBonusValue = outputBonusPercent * this.outputAmount();
    const outputTotal = this.outputAmount() + outputBonusValue;

    loseCurrency(input.name, this.inputAmount());
    gainCurrency(output.name, outputTotal);

    sendDesignEvent(
      `Game:Town:Market:TradeCurrency:${input.name}`,
      this.inputAmount(),
    );
    sendDesignEvent(
      `Game:Town:Market:GainCurrency:${output.name}`,
      outputTotal,
    );

    notifySuccess(
      `Traded ${this.inputAmount()} ${input.name} for ${outputTotal} ${output.name} (+${outputBonusPercent * 100}% bonus)!`,
    );
  }
}

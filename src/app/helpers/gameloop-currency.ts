import { currencyClaimsGetCurrent } from '@helpers/currency';

export function gameloopCurrency(numTicks: number): void {
  for (let i = 0; i < numTicks; i++) {
    currencyClaimsGetCurrent();
  }
}

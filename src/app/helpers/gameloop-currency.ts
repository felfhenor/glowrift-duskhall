import { gainCurrentCurrencyClaims } from '@helpers/currency';

export function currencyGameloop(numTicks: number): void {
  for (let i = 0; i < numTicks; i++) {
    gainCurrentCurrencyClaims();
  }
}

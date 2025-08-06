import type { CurrencyContent } from '@interfaces';

/**
 * Calculate lossy currency conversion output amount given input amount
 * Output is halved compared to normal conversion
 */
export function calculateLossyOutputAmount(
  inputCurrency: CurrencyContent,
  outputCurrency: CurrencyContent,
  inputAmount: number
): number {
  return Math.floor((inputCurrency.value / outputCurrency.value) * inputAmount / 2);
}

/**
 * Calculate required input amount for desired lossy currency conversion output
 * Input required is doubled compared to normal conversion
 */
export function calculateLossyInputAmount(
  inputCurrency: CurrencyContent,
  outputCurrency: CurrencyContent,
  outputAmount: number
): number {
  return Math.floor(outputAmount * (outputCurrency.value / inputCurrency.value) * 2);
}
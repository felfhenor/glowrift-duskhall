import {
  currencyConversionInputAmount,
  currencyConversionOutputAmount,
} from '@helpers/currency-conversion';
import type { CurrencyContent, CurrencyId } from '@interfaces';
import { describe, expect, it } from 'vitest';

describe('Currency Conversion', () => {
  const manaCurrency: CurrencyContent = {
    id: 'mana' as CurrencyId,
    name: 'Mana',
    value: 1,
  };

  const fireSliverCurrency: CurrencyContent = {
    id: 'fire-sliver' as CurrencyId,
    name: 'Fire Sliver',
    value: 5,
  };

  const fireShardCurrency: CurrencyContent = {
    id: 'fire-shard' as CurrencyId,
    name: 'Fire Shard',
    value: 25,
  };

  describe('calculateCurrencyConversionOutputAmount', () => {
    it('should halve output for equal value currencies', () => {
      const result = currencyConversionOutputAmount(
        manaCurrency,
        manaCurrency,
        100,
      );
      expect(result).toBe(50); // 100 / 2 = 50
    });

    it('should convert higher value to lower value currency with loss', () => {
      // Normal conversion: (5/1) * 25 = 125
      // Lossy conversion: 125 / 2 = 62.5 -> 62 (floored)
      const result = currencyConversionOutputAmount(
        fireSliverCurrency,
        manaCurrency,
        25,
      );
      expect(result).toBe(62);
    });

    it('should convert lower value to higher value currency with loss', () => {
      // Normal conversion: (1/5) * 100 = 20
      // Lossy conversion: 20 / 2 = 10
      const result = currencyConversionOutputAmount(
        manaCurrency,
        fireSliverCurrency,
        100,
      );
      expect(result).toBe(10);
    });

    it('should handle complex conversion ratios', () => {
      // Normal conversion: (25/5) * 10 = 50
      // Lossy conversion: 50 / 2 = 25
      const result = currencyConversionOutputAmount(
        fireShardCurrency,
        fireSliverCurrency,
        10,
      );
      expect(result).toBe(25);
    });
  });

  describe('calculateCurrencyConversionInputAmount', () => {
    it('should double input for equal value currencies', () => {
      const result = currencyConversionInputAmount(
        manaCurrency,
        manaCurrency,
        50,
      );
      expect(result).toBe(100); // 50 * 2 = 100
    });

    it('should require double input for higher to lower value conversion', () => {
      // Normal input needed: 62 * (1/5) = 12.4 -> 12
      // Lossy input needed: 12 * 2 = 24
      const result = currencyConversionInputAmount(
        fireSliverCurrency,
        manaCurrency,
        62,
      );
      expect(result).toBe(24); // 62 * (1/5) * 2 = 24.8 -> 24
    });

    it('should require double input for lower to higher value conversion', () => {
      // Normal input needed: 10 * (5/1) = 50
      // Lossy input needed: 50 * 2 = 100
      const result = currencyConversionInputAmount(
        manaCurrency,
        fireSliverCurrency,
        10,
      );
      expect(result).toBe(100);
    });
  });

  describe('round-trip conversion prevention', () => {
    it('should prevent exact round-trip conversion', () => {
      const startAmount = 100;

      // Convert 100 Mana to Fire Sliver
      const fireSliverAmount = currencyConversionOutputAmount(
        manaCurrency,
        fireSliverCurrency,
        startAmount,
      );

      // Convert back from Fire Sliver to Mana
      const finalManaAmount = currencyConversionOutputAmount(
        fireSliverCurrency,
        manaCurrency,
        fireSliverAmount,
      );

      // Should lose value in round-trip
      expect(finalManaAmount).toBeLessThan(startAmount);
    });

    it('should be consistently lossy regardless of conversion direction', () => {
      // Convert A -> B
      const outputAB = currencyConversionOutputAmount(
        manaCurrency,
        fireSliverCurrency,
        100,
      );

      // Calculate what input is needed for the same output
      const inputForSameOutput = currencyConversionInputAmount(
        manaCurrency,
        fireSliverCurrency,
        outputAB,
      );

      // Should need more than original input
      expect(inputForSameOutput).toBeGreaterThanOrEqual(100);

      // More specifically, since we get half output and need double input,
      // the round-trip should require 4x the original amount
      const expectedInput =
        outputAB * 2 * (fireSliverCurrency.value / manaCurrency.value);
      expect(inputForSameOutput).toBe(expectedInput);
    });
  });
});

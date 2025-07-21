import { defaultCurrencyBlock } from '@helpers/defaults';
import { getFestivalProductionMultiplier } from '@helpers/festival-production';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { getClaimedNodes } from '@helpers/world';
import type { CurrencyBlock, GameCurrency, WorldLocation } from '@interfaces';

export function getCurrency(currency: GameCurrency): number {
  return gamestate().currency.currencies[currency] ?? 0;
}

export function hasCurrency(type: GameCurrency, needed: number): boolean {
  return getCurrency(type) >= needed;
}

export function gainCurrencies(currencies: Partial<CurrencyBlock>): void {
  updateGamestate((state) => {
    Object.keys(currencies).forEach((deltaCurrency) => {
      const key = deltaCurrency as GameCurrency;
      const multiplier = 1 + getFestivalProductionMultiplier(key);
      const gainedCurrency = (currencies[key] ?? 0) * multiplier;

      state.currency.currencies[key] = Math.max(
        0,
        state.currency.currencies[key] + gainedCurrency,
      );
    });
    return state;
  });
}

export function gainCurrency(currency: GameCurrency, amount = 1): void {
  gainCurrencies({
    [currency]: amount,
  });
}

export function loseCurrency(currency: GameCurrency, amount = 1): void {
  gainCurrency(currency, -amount);
}

export function gainCurrentCurrencyClaims(): void {
  const currencyGains = gamestate().currency.currencyPerTickEarnings;
  gainCurrencies(currencyGains);
}

export function getCurrencyClaimsForNode(node: WorldLocation): CurrencyBlock {
  const base = defaultCurrencyBlock();

  switch (node.nodeType) {
    case 'cave': {
      node.elements.forEach((el) => {
        const currency: GameCurrency = `${el.element} Sliver`;
        base[currency] += (1 / 100) * el.intensity;
      });
      break;
    }

    case 'dungeon': {
      node.elements.forEach((el) => {
        const currency: GameCurrency = `${el.element} Shard`;
        base[currency] += (1 / 100) * el.intensity;
      });
      break;
    }

    case 'castle': {
      node.elements.forEach((el) => {
        const currency: GameCurrency = `${el.element} Crystal`;
        base[currency] += (1 / 100) * el.intensity;
      });
      break;
    }

    case 'village': {
      base.Mana += 2;
      break;
    }
    case 'town': {
      base.Mana += 1;
      break;
    }
  }

  return base;
}

export function getUpdatedCurrencyClaims(): CurrencyBlock {
  const base = defaultCurrencyBlock();
  const allClaimed = getClaimedNodes();

  allClaimed.forEach((node) => {
    const claims = getCurrencyClaimsForNode(node);
    Object.keys(claims).forEach((currencyChange) => {
      base[currencyChange as GameCurrency] +=
        claims[currencyChange as GameCurrency];
    });
  });

  return base;
}

export function mergeCurrencyClaims(delta: CurrencyBlock) {
  const current = gamestate().currency.currencyPerTickEarnings;
  Object.keys(delta).forEach((currencyChange) => {
    current[currencyChange as GameCurrency] +=
      delta[currencyChange as GameCurrency];
  });

  updateCurrencyClaims(current);
}

export function updateCurrencyClaims(
  claims = getUpdatedCurrencyClaims(),
): void {
  updateGamestate((state) => {
    state.currency.currencyPerTickEarnings = claims;
    return state;
  });
}

import { getEntry } from '@helpers/content';
import { getDefaultCurrencyBlock } from '@helpers/defaults';
import { getFestivalProductionMultiplier } from '@helpers/festival-production';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { locationTraitCurrencyAllGenerateModifiers } from '@helpers/trait-location-currency';
import { getClaimedNodes } from '@helpers/world';
import type {
  CurrencyBlock,
  CurrencyContent,
  GameCurrency,
  WorldLocation,
} from '@interfaces';

export function getCurrency(currency: GameCurrency): number {
  return gamestate().currency.currencies[currency] ?? 0;
}

export function hasCurrency(type: GameCurrency, needed: number): boolean {
  return getCurrency(type) >= needed;
}

export function hasCurrencies(currencies: CurrencyBlock): boolean {
  return Object.keys(currencies).every((curr) =>
    hasCurrency(curr as GameCurrency, currencies[curr as GameCurrency]),
  );
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

export function loseCurrencies(currencies: Partial<CurrencyBlock>): void {
  Object.keys(currencies).forEach((curr) => {
    currencies[curr as GameCurrency] = -currencies[curr as GameCurrency]!;
  });

  gainCurrencies(currencies);
}

export function loseCurrency(currency: GameCurrency, amount = 1): void {
  gainCurrency(currency, -amount);
}

export function gainCurrentCurrencyClaims(): void {
  const currencyGains = gamestate().currency.currencyPerTickEarnings;
  gainCurrencies(currencyGains);
}

export function getCurrencyClaimsForNode(node: WorldLocation): CurrencyBlock {
  const base = getDefaultCurrencyBlock();

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

  const modifiers = locationTraitCurrencyAllGenerateModifiers(node);
  modifiers.forEach((mod) => {
    const currency = getEntry<CurrencyContent>(mod.currencyId);
    if (!currency) return;

    base[currency.name] += currency.value;
  });

  return base;
}

export function getUpdatedCurrencyClaims(): CurrencyBlock {
  const base = getDefaultCurrencyBlock();
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

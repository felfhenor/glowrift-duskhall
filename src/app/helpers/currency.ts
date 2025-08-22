import { getEntry } from '@helpers/content';
import { defaultCurrencyBlock } from '@helpers/defaults';
import { festivalProductionMultiplier } from '@helpers/festival-production';
import { error } from '@helpers/logging';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { locationTraitCurrencyAllGenerateModifiers } from '@helpers/trait-location-currency';
import { locationGetClaimed } from '@helpers/world-location';
import { locationUpgradeStatTotal } from '@helpers/world-location-upgrade';
import type {
  CurrencyBlock,
  CurrencyContent,
  GameCurrency,
  WorldLocation,
} from '@interfaces';
import { sortBy } from 'es-toolkit/compat';

/**
 * Canonical currency ordering as specified in the requirements:
 * 1. Mana
 * 2. Elemental currencies in order: Earth, Fire, Water, Air
 * 3. Within each element: Sliver, Shard, Crystal, Core
 * 4. Dusts in rarity order: Common, Uncommon, Rare, Mystical, Legendary, Unique
 * 5. Soul Essence
 */
export const CURRENCY_ORDER: GameCurrency[] = [
  'Mana',
  'Earth Sliver',
  'Earth Shard',
  'Earth Crystal',
  'Earth Core',
  'Fire Sliver',
  'Fire Shard',
  'Fire Crystal',
  'Fire Core',
  'Water Sliver',
  'Water Shard',
  'Water Crystal',
  'Water Core',
  'Air Sliver',
  'Air Shard',
  'Air Crystal',
  'Air Core',
  'Common Dust',
  'Uncommon Dust',
  'Rare Dust',
  'Mystical Dust',
  'Legendary Dust',
  'Unique Dust',
  'Soul Essence',
];

/**
 * Sort currencies according to the canonical ordering
 */
export function currencySortByOrder(
  currencies: GameCurrency[],
): GameCurrency[] {
  const orderMap = new Map(
    CURRENCY_ORDER.map((currency, index) => [currency, index]),
  );

  return sortBy(
    currencies,
    (currency) => orderMap.get(currency) ?? Number.MAX_SAFE_INTEGER,
  );
}

export function currencyGet(currency: GameCurrency): number {
  return gamestate().currency.currencies[currency] ?? 0;
}

export function currencyHasAmount(type: GameCurrency, needed: number): boolean {
  return currencyGet(type) >= needed;
}

export function currencyHasMultipleAmounts(currencies: CurrencyBlock): boolean {
  return Object.keys(currencies).every((curr) =>
    currencyHasAmount(curr as GameCurrency, currencies[curr as GameCurrency]),
  );
}

export function currencyGainMultiple(currencies: Partial<CurrencyBlock>): void {
  updateGamestate((state) => {
    Object.keys(currencies).forEach((deltaCurrency) => {
      const key = deltaCurrency as GameCurrency;
      const multiplier = 1 + festivalProductionMultiplier(key);
      const gainedCurrency = (currencies[key] ?? 0) * multiplier;

      const newValue = state.currency.currencies[key] + gainedCurrency;
      if (isNaN(newValue)) {
        error(
          'Currency',
          `Invalid currency value for ${key}: ${newValue}`,
          new Error().stack,
        );
        return;
      }

      state.currency.currencies[key] = Math.max(0, newValue);
    });
    return state;
  });
}

export function currencyGain(currency: GameCurrency, amount = 1): void {
  currencyGainMultiple({
    [currency]: amount,
  });
}

export function currencyLoseMultiple(currencies: Partial<CurrencyBlock>): void {
  Object.keys(currencies).forEach((curr) => {
    currencies[curr as GameCurrency] = -currencies[curr as GameCurrency]!;
  });

  currencyGainMultiple(currencies);
}

export function currencyLose(currency: GameCurrency, amount = 1): void {
  currencyGain(currency, -amount);
}

export function currencyClaimsGetCurrent(): void {
  const currencyGains = gamestate().currency.currencyPerTickEarnings;
  currencyGainMultiple(currencyGains);
}

export function currencyClaimsGetForNode(node: WorldLocation): CurrencyBlock {
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
      base.Mana += 1;
      break;
    }
    case 'town': {
      base.Mana += 5;
      break;
    }
  }

  // factor in trait modifiers
  const modifiers = locationTraitCurrencyAllGenerateModifiers(node);
  modifiers.forEach((mod) => {
    const currency = getEntry<CurrencyContent>(mod.currencyId);
    if (!currency) return;

    base[currency.name] += currency.value;
  });

  const dustBoost = locationUpgradeStatTotal(
    node,
    'boostedDustProductionPerLevel',
  );
  if (dustBoost > 0) {
    base['Common Dust'] += dustBoost;
  }

  // factor in location upgrades
  const percentMultiplier =
    1 +
    locationUpgradeStatTotal(node, 'boostedProductionValuePercentPerLevel') /
      100;

  Object.keys(base).forEach((currKey) => {
    const curr = currKey as GameCurrency;
    base[curr] *= percentMultiplier;
  });

  return base;
}

export function currencyClaimsGetUpdated(): CurrencyBlock {
  const base = defaultCurrencyBlock();
  const allClaimed = locationGetClaimed();

  allClaimed.forEach((node) => {
    const claims = currencyClaimsGetForNode(node);
    Object.keys(claims).forEach((currencyChange) => {
      base[currencyChange as GameCurrency] +=
        claims[currencyChange as GameCurrency];
    });
  });

  return base;
}

export function currencyClaimsGain(node: WorldLocation) {
  const claims = currencyClaimsGetForNode(node);
  currencyClaimsMerge(claims);
}

export function currencyClaimsLose(node: WorldLocation) {
  const claims = currencyClaimsGetForNode(node);
  Object.keys(claims).forEach(
    (currencyKey) =>
      (claims[currencyKey as GameCurrency] =
        -claims[currencyKey as GameCurrency]),
  );

  currencyClaimsMerge(claims);
}

export function currencyClaimsMerge(delta: CurrencyBlock) {
  const current = gamestate().currency.currencyPerTickEarnings;
  Object.keys(delta).forEach((currencyChange) => {
    current[currencyChange as GameCurrency] +=
      delta[currencyChange as GameCurrency];
  });

  currencyClaimsUpdate(current);
}

export function currencyClaimsUpdate(
  claims = currencyClaimsGetUpdated(),
): void {
  updateGamestate((state) => {
    state.currency.currencyPerTickEarnings = claims;
    return state;
  });
}

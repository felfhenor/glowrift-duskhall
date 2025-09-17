import { actionItemBuyValue } from '@helpers/action-equipment';
import {
  equipmentAllDefinitions,
  equipmentCreate,
  equipmentPickRandomDefinitionByRarity,
} from '@helpers/creator-equipment';
import { currencyHasAmount, currencyLose } from '@helpers/currency';
import { itemInventoryAdd } from '@helpers/inventory-equipment';
import { rngSucceedsChance } from '@helpers/rng';
import { playSFX } from '@helpers/sfx';
import { updateGamestate } from '@helpers/state-game';
import { talentTownStatTotalForAllHeroes } from '@helpers/talent';
import {
  timerAddMerchantRefreshAction,
  timerGetRegisterTick,
} from '@helpers/timer';
import { townBuildingLevel } from '@helpers/town';
import { traitAddToEquipment } from '@helpers/trait-equipment';
import type { EquipmentItem } from '@interfaces';

export function merchantMaxItems(): number {
  return 8 + Math.floor(townBuildingLevel('Merchant') / 2);
}

export function merchantMaxItemLevel(): number {
  return (
    5 +
    Math.floor(townBuildingLevel('Merchant') * 5) +
    talentTownStatTotalForAllHeroes('merchantFindItemBonus')
  );
}

export function merchantTraitChance(): number {
  return 3 * townBuildingLevel('Merchant');
}

function merchantItemGenerate(): EquipmentItem | undefined {
  const allItems = equipmentAllDefinitions().filter(
    (item) => item.dropLevel <= merchantMaxItemLevel(),
  );

  const chosenItem = equipmentPickRandomDefinitionByRarity(allItems);
  if (!chosenItem) return undefined;

  const createdItem = equipmentCreate(chosenItem);

  if (rngSucceedsChance(merchantTraitChance())) {
    createdItem.mods ??= {};
    createdItem.mods.traitIds = [];
    traitAddToEquipment(createdItem);
  }

  return createdItem;
}

export function merchantGenerateItems(): void {
  const numItems = merchantMaxItems();

  const items: EquipmentItem[] = [];

  for (let i = 0; i < numItems; i++) {
    const item = merchantItemGenerate();
    if (!item) continue;

    items.push(item);
  }

  updateGamestate((state) => {
    state.town.merchant.soldItems = items;
    return state;
  });

  playSFX('merchant-reset', 0);
}

export function merchantScheduleNextRefresh(): void {
  timerAddMerchantRefreshAction(timerGetRegisterTick(3600));
}

export function merchantBuy(item: EquipmentItem): void {
  const cost = actionItemBuyValue(item);
  if (!currencyHasAmount('Mana', cost)) {
    return;
  }

  currencyLose('Mana', cost);
  itemInventoryAdd(item);

  updateGamestate((state) => {
    const index = state.town.merchant.soldItems.findIndex(
      (i) => i?.id === item.id,
    );
    state.town.merchant.soldItems[index] = undefined;
    return state;
  });
}

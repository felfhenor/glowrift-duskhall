import { actionItemBuyValue } from '@helpers/action-equipment';
import {
  equipmentAllDefinitions,
  equipmentCreate,
  equipmentPickRandomDefinitionByRarity,
} from '@helpers/creator-equipment';
import { currencyHasAmount, currencyLose } from '@helpers/currency';
import { itemInventoryAdd } from '@helpers/inventory-equipment';
import { gamestate, updateGamestate } from '@helpers/state-game';
import type { EquipmentItem } from '@interfaces';

export function merchantMaxItems(): number {
  return 8 + Math.floor(gamestate().town.buildingLevels.Merchant / 5);
}

function merchantItemGenerate(): EquipmentItem {
  const allItems = equipmentAllDefinitions().filter(
    (item) => item.dropLevel <= gamestate().town.buildingLevels.Merchant,
  );
  const chosenItem = equipmentPickRandomDefinitionByRarity(allItems);

  return equipmentCreate(chosenItem);
}

export function merchantGenerateItems(): void {
  const numItems = merchantMaxItems();

  const items: EquipmentItem[] = [];

  for (let i = 0; i < numItems; i++) {
    items.push(merchantItemGenerate());
  }

  updateGamestate((state) => {
    state.town.merchant.soldItems = items;
    return state;
  });
}

export function merchantResetTicks(): void {
  updateGamestate((state) => {
    state.town.merchant.ticksUntilRefresh = 3600;
    return state;
  });
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

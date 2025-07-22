import { itemBuyValue } from '@helpers/action-equipment';
import {
  allItemDefinitions,
  createItem,
  pickRandomItemDefinitionBasedOnRarity,
} from '@helpers/creator-equipment';
import { hasCurrency, loseCurrency } from '@helpers/currency';
import { addItemToInventory } from '@helpers/inventory-equipment';
import { gamestate, updateGamestate } from '@helpers/state-game';
import type { EquipmentItem } from '@interfaces';

export function townMerchantItems(): number {
  return 8 + Math.floor(gamestate().town.buildingLevels.Merchant / 5);
}

export function generateMerchantItem(): EquipmentItem {
  const allItems = allItemDefinitions().filter(
    (item) => item.dropLevel <= gamestate().town.buildingLevels.Merchant,
  );
  const chosenItem = pickRandomItemDefinitionBasedOnRarity(allItems);

  return createItem(chosenItem);
}

export function generateMerchantItems(): void {
  const numItems = townMerchantItems();

  const items: EquipmentItem[] = [];

  for (let i = 0; i < numItems; i++) {
    items.push(generateMerchantItem());
  }

  updateGamestate((state) => {
    state.town.merchant.soldItems = items;
    return state;
  });
}

export function resetTownMerchantTicks(): void {
  updateGamestate((state) => {
    state.town.merchant.ticksUntilRefresh = 3600;
    return state;
  });
}

export function buyItem(itemSlot: number): void {
  const item = gamestate().town.merchant.soldItems[itemSlot];
  if (!item) {
    return;
  }

  const cost = itemBuyValue(item);
  if (!hasCurrency('Mana', cost)) {
    return;
  }

  loseCurrency('Mana', cost);
  addItemToInventory(item);

  updateGamestate((state) => {
    state.town.merchant.soldItems[itemSlot] = undefined;
    return state;
  });
}

import { updateGamestate } from '@helpers/state-game';
import type { EquipmentItem, EquipmentSkill } from '@interfaces';

export function favoriteToggleItem(item: EquipmentItem): void {
  updateGamestate((state) => {
    const stateItem = state.inventory.items.find((i) => i.id === item.id);
    if (stateItem) {
      stateItem.isFavorite = !stateItem.isFavorite;
    }

    return state;
  });
}

export function favoriteToggleSkill(skill: EquipmentSkill): void {
  updateGamestate((state) => {
    const stateSkill = state.inventory.skills.find((s) => s.id === skill.id);
    if (stateSkill) {
      stateSkill.isFavorite = !stateSkill.isFavorite;
    }

    return state;
  });
}

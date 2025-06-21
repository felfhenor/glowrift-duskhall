import { Component, computed } from '@angular/core';
import {
  gamestate,
  getOption,
  setOption,
  showInventoryMenu,
  sortedRarityList,
} from '../../helpers';
import { EquipmentItem, EquipmentSkill, EquipmentSlot, InventorySlotType } from '../../interfaces';
import { CardPageComponent } from '../card-page/card-page.component';
import { IconComponent } from '../icon/icon.component';
import { InventoryGridItemComponent } from '../inventory-grid-item/inventory-grid-item.component';
import { InventoryGridSkillComponent } from '../inventory-grid-skill/inventory-grid-skill.component';

@Component({
  selector: 'app-panel-inventory',
  imports: [
    CardPageComponent,
    IconComponent,
    InventoryGridItemComponent,
    InventoryGridSkillComponent,
  ],
  templateUrl: './panel-inventory.component.html',
  styleUrl: './panel-inventory.component.scss',
})
export class PanelInventoryComponent {
  public currentItemType = computed(() => getOption('inventoryFilter'));

  public readonly allItemTypes: Array<{
    name: string;
    type: InventorySlotType;
  }> = [
    { name: 'Accessories', type: 'accessory' },
    { name: 'Armor', type: 'armor' },
    { name: 'Trinkets', type: 'trinket' },
    { name: 'Weapons', type: 'weapon' },
    { name: 'Spells', type: 'skill' },
  ];

  public itemCounts = computed(() => {
    const items = gamestate().inventory.items;
    const counts: Record<InventorySlotType, number> = {
      accessory: 0,
      armor: 0,
      trinket: 0,
      weapon: 0,
      skill: 0,
    };

    items.forEach((item: EquipmentItem) => {
      const itemType = item.__type;
      if (itemType in counts) {
        counts[itemType]++;
      }
    });

    counts.skill = gamestate().inventory.skills.length;

    return counts;
  });

  public getItemCountForType(type: EquipmentSlot): number {
    return this.itemCounts()[type];
  }

  public items = computed(() =>
    sortedRarityList<EquipmentItem>(
      gamestate().inventory.items.filter(
        (i: EquipmentItem) => i.__type === this.currentItemType(),
      ),
    ),
  );

  public skills = computed(() =>
    sortedRarityList<EquipmentSkill>(gamestate().inventory.skills),
  );

  closeMenu() {
    showInventoryMenu.set(false);
  }

  changeItemType(type: InventorySlotType) {
    setOption('inventoryFilter', type);
  }
}

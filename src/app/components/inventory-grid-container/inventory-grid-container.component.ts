import type { OnInit } from '@angular/core';
import { Component, computed, input, model, output } from '@angular/core';
import { InventoryGridItemComponent } from '@components/inventory-grid-item/inventory-grid-item.component';
import { InventoryGridSkillComponent } from '@components/inventory-grid-skill/inventory-grid-skill.component';
import { sortedRarityList } from '@helpers/item';
import { gamestate } from '@helpers/state-game';
import type {
  EquipmentItem,
  EquipmentItemId,
  EquipmentSlot,
  InventorySlotType,
} from '@interfaces/content-equipment';
import type {
  EquipmentSkill,
  EquipmentSkillId,
} from '@interfaces/content-skill';
import type { Hero } from '@interfaces/hero';
import type { ItemAction, SkillAction } from '@interfaces/town';

@Component({
  selector: 'app-inventory-grid-container',
  imports: [InventoryGridSkillComponent, InventoryGridItemComponent],
  templateUrl: './inventory-grid-container.component.html',
  styleUrl: './inventory-grid-container.component.scss',
})
export class InventoryGridContainerComponent implements OnInit {
  public currentItemType = model<InventorySlotType>();
  public allowedItemTypes = input<InventorySlotType[]>([
    'accessory',
    'armor',
    'trinket',
    'weapon',
    'skill',
  ]);

  public disabledItemIds = input<EquipmentItemId[]>([]);
  public disabledSkillIds = input<EquipmentSkillId[]>([]);

  public allowedItemActions = input<ItemAction[]>([]);
  public allowedSkillActions = input<SkillAction[]>([]);

  public allowItemClicks = input<boolean>(false);
  public allowSkillClicks = input<boolean>(false);

  public compareItemToHero = input<Hero>();

  public containerHeight = input<number>(200);

  public itemClicked = output<EquipmentItem>();
  public skillClicked = output<EquipmentSkill>();

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

  public visibleItemTypes = computed(() =>
    this.allItemTypes.filter((f) => this.allowedItemTypes().includes(f.type)),
  );

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

  ngOnInit() {
    if (!this.currentItemType())
      this.currentItemType.set(this.visibleItemTypes()[0]?.type);
  }
}

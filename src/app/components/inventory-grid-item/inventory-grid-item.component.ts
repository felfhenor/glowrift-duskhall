import { Component, computed, input, output, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconItemComponent } from '@components/icon-item/icon-item.component';
import { MarkerHeroNameComponent } from '@components/marker-hero-name/marker-hero-name.component';
import { OptionsBaseComponent } from '@components/panel-options/option-base-page.component';
import { TeleportToDirective } from '@directives/teleport.to.directive';
import {
  actionItemSalvage,
  actionItemSalvageValue,
  allHeroes,
  favoriteToggleItem,
  itemElementMultiplier,
  itemEquip,
  itemStat,
} from '@helpers';
import type {
  EquipmentItem,
  EquipmentItemId,
  EquipmentSlot,
  GameElement,
  Hero,
  ItemAction,
  ItemOrganizeSetting,
} from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';
import { sortBy } from 'es-toolkit/compat';

const findItemsMatchingElement = (
  items: EquipmentItem[],
  element: GameElement,
) => {
  return items.filter((item) => itemElementMultiplier(item, element) > 0);
};

const ITEM_SORTS: Record<
  ItemOrganizeSetting,
  (items: EquipmentItem[]) => EquipmentItem[]
> = {
  'element-air': (items) =>
    sortBy(
      findItemsMatchingElement(items, 'Air'),
      (i) => -itemElementMultiplier(i, 'Air'),
    ),
  'element-earth': (items) =>
    sortBy(
      findItemsMatchingElement(items, 'Earth'),
      (i) => -itemElementMultiplier(i, 'Earth'),
    ),
  'element-fire': (items) =>
    sortBy(
      findItemsMatchingElement(items, 'Fire'),
      (i) => -itemElementMultiplier(i, 'Fire'),
    ),
  'element-water': (items) =>
    sortBy(
      findItemsMatchingElement(items, 'Water'),
      (i) => -itemElementMultiplier(i, 'Water'),
    ),

  'stat-aura': (items) =>
    sortBy(
      items.filter((i) => itemStat(i, 'Aura') > 0),
      (i) => -itemStat(i, 'Aura'),
    ),
  'stat-health': (items) =>
    sortBy(
      items.filter((i) => itemStat(i, 'Health') > 0),
      (i) => -itemStat(i, 'Health'),
    ),
  'stat-force': (items) =>
    sortBy(
      items.filter((i) => itemStat(i, 'Force') > 0),
      (i) => -itemStat(i, 'Force'),
    ),
  'stat-speed': (items) =>
    sortBy(
      items.filter((i) => itemStat(i, 'Speed') > 0),
      (i) => -itemStat(i, 'Speed'),
    ),

  default: (items) => items,
};

@Component({
  selector: 'app-inventory-grid-item',
  imports: [
    IconItemComponent,
    TippyDirective,
    DecimalPipe,
    IconBlankSlotComponent,
    FormsModule,
    TeleportToDirective,
    MarkerHeroNameComponent,
  ],
  templateUrl: './inventory-grid-item.component.html',
  styleUrl: './inventory-grid-item.component.scss',
})
export class InventoryGridItemComponent extends OptionsBaseComponent {
  public items = input.required<(EquipmentItem | undefined)[]>();
  public disabledItemIds = input<EquipmentItemId[]>([]);
  public clickableItems = input<boolean>();
  public allowedActions = input<ItemAction[]>([]);
  public compareWithEquippedHero = input<Hero>();
  public isShopList = input<boolean>(false);
  public showEquippedBy = input<boolean>(false);

  public itemClicked = output<EquipmentItem>();

  public currentSortFilter = signal<ItemOrganizeSetting>(
    this.getOption('organizeItems'),
  );

  public allHeroes = computed(() => allHeroes());

  public sortedFilteredItems = computed(() => {
    return ITEM_SORTS[this.currentSortFilter()](
      this.items().filter(Boolean) as EquipmentItem[],
    );
  });

  public readonly sortFilters = [
    { setting: 'default', label: 'Default' },
    { setting: 'element-air', label: 'Element: Air' },
    { setting: 'element-earth', label: 'Element: Earth' },
    { setting: 'element-fire', label: 'Element: Fire' },
    { setting: 'element-water', label: 'Element: Water' },
    { setting: 'stat-aura', label: 'Stat: Aura' },
    { setting: 'stat-health', label: 'Stat: Health' },
    { setting: 'stat-force', label: 'Stat: Force' },
    { setting: 'stat-speed', label: 'Stat: Speed' },
  ];

  salvageValue(item: EquipmentItem) {
    return actionItemSalvageValue(item);
  }

  salvageItem(item: EquipmentItem) {
    actionItemSalvage(item);
  }

  toggleFavorite(item: EquipmentItem) {
    favoriteToggleItem(item);
  }

  compareWithItem(item: EquipmentItem) {
    return this.compareWithEquippedHero()?.equipment[item.__type];
  }

  heroEquippedItem(
    hero: Hero,
    itemSlot: EquipmentSlot,
  ): EquipmentItem | undefined {
    return hero.equipment[itemSlot];
  }

  equipItem(item: EquipmentItem, hero: Hero) {
    itemEquip(hero, item);
  }
}

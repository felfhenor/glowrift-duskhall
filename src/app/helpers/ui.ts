import { computed, signal } from '@angular/core';
import type { WorldPosition, Hero, EquipmentItemContent, EquipmentSkillContent, EquipmentSlot } from '@interfaces';
import { gamestate } from '@helpers/state-game';

export const windowWidth = signal<number>(-1);
export const windowHeight = signal<number>(-1);

export const windowWidthTiles = computed(() => Math.floor(windowWidth() / 64));
export const windowHeightTiles = computed(() =>
  Math.floor(windowHeight() / 64),
);

export const globalStatusText = signal<string>('');

export const showCurrencyList = signal<boolean>(false);
export const showLocationMenu = signal<WorldPosition | undefined>(undefined);
export const showOptionsMenu = signal<boolean>(false);
export const showInventoryMenu = signal<boolean>(false);
export const showHeroesMenu = signal<boolean>(false);
export const showCombatMenu = signal<boolean>(false);
export const showTownMenu = signal<boolean>(false);
export const showWorldMenu = signal<boolean>(false);

export const contextMenuStats = signal<{
  visible: boolean;
  x: number;
  y: number;
  itemData?: EquipmentItemContent;
  compareItem?: EquipmentItemContent;
  skillData?: EquipmentSkillContent;
  compareSkill?: EquipmentSkillContent;
  equippingHero?: Hero;
}>({
  visible: false,
  x: 0,
  y: 0,
});

export const isCatchingUp = signal<boolean>(false);

export function isPageVisible(): boolean {
  return !document.hidden;
}

export function closeAllMenus() {
  showCurrencyList.set(false);
  showHeroesMenu.set(false);
  showCombatMenu.set(false);
  showOptionsMenu.set(false);
  showInventoryMenu.set(false);
  showTownMenu.set(false);
  showWorldMenu.set(false);
  showLocationMenu.set(undefined);
  contextMenuStats.set({
    visible: false,
    x: 0,
    y: 0,
  });
}

export function showContextMenuStats(options: {
  x: number;
  y: number;
  itemData?: EquipmentItemContent;
  compareItem?: EquipmentItemContent;
  skillData?: EquipmentSkillContent;
  compareSkill?: EquipmentSkillContent;
  equippingHero?: Hero;
}) {
  contextMenuStats.set({
    visible: true,
    ...options,
  });
}

export function hideContextMenuStats() {
  contextMenuStats.set({
    visible: false,
    x: 0,
    y: 0,
  });
}

export function findEquippedItem(itemId: string): { hero: Hero; slot: EquipmentSlot } | undefined {
  const state = gamestate();
  for (const hero of state.hero.heroes) {
    for (const [slot, item] of Object.entries(hero.equipment)) {
      if (item && item.id === itemId) {
        return { hero, slot: slot as EquipmentSlot };
      }
    }
  }
  return undefined;
}

export function findEquippedSkill(skillId: string): { hero: Hero; slot: number } | undefined {
  const state = gamestate();
  for (const hero of state.hero.heroes) {
    for (let slot = 0; slot < hero.skills.length; slot++) {
      const skill = hero.skills[slot];
      if (skill && skill.id === skillId) {
        return { hero, slot };
      }
    }
  }
  return undefined;
}

import { Component, computed, input, output, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';
import {
  actionSkillSalvage,
  actionSkillSalvageValue,
  allHeroes,
  favoriteToggleSkill,
  skillEquip,
} from '@helpers';
import type {
  EquipmentSkill,
  EquipmentSkillId,
  Hero,
  SkillAction,
} from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';
import { RepeatPipe } from 'ngxtension/repeat-pipe';

@Component({
  selector: 'app-inventory-grid-skill',
  imports: [TippyDirective, DecimalPipe, IconSkillComponent, RepeatPipe],
  templateUrl: './inventory-grid-skill.component.html',
  styleUrl: './inventory-grid-skill.component.scss',
})
export class InventoryGridSkillComponent {
  public skills = input.required<EquipmentSkill[]>();
  public disabledSkillIds = input<EquipmentSkillId[]>([]);
  public clickableSkills = input<boolean>();

  public compareWithEquippedHero = input<Hero>();
  public compareWithEquippedHeroSlot = input<number>();

  public allowedActions = input<SkillAction[]>([]);

  public skillClicked = output<EquipmentSkill>();

  public animateItem = signal<string>('');

  public compareSkill = computed(
    () =>
      this.compareWithEquippedHero()?.skills[
        this.compareWithEquippedHeroSlot() ?? 0
      ],
  );

  public allHeroes = computed(() => allHeroes());

  salvageValue(item: EquipmentSkill) {
    return actionSkillSalvageValue(item);
  }

  salvageItem(item: EquipmentSkill) {
    actionSkillSalvage(item);
  }

  toggleFavorite(item: EquipmentSkill) {
    favoriteToggleSkill(item);
  }

  heroEquippedSkill(hero: Hero, skillSlot: number): EquipmentSkill | undefined {
    return hero.skills[skillSlot];
  }

  equipSkill(item: EquipmentSkill, hero: Hero, slot: number) {
    skillEquip(hero, item, slot);
  }
}

import { Component, computed, input, output, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';
import { skillSalvage, skillSalvageValue, toggleSkillFavorite } from '@helpers';
import type {
  EquipmentSkill,
  EquipmentSkillId,
  Hero,
  SkillAction,
} from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-inventory-grid-skill',
  imports: [TippyDirective, DecimalPipe, IconSkillComponent],
  templateUrl: './inventory-grid-skill.component.html',
  styleUrl: './inventory-grid-skill.component.css',
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

  salvageValue(item: EquipmentSkill) {
    return skillSalvageValue(item);
  }

  salvageItem(item: EquipmentSkill) {
    skillSalvage(item);
  }

  toggleFavorite(item: EquipmentSkill) {
    toggleSkillFavorite(item);
  }
}

import { Component, input, output, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';
import { skillSalvage, skillSalvageValue } from '@helpers';
import type {
  EquipmentSkill,
  EquipmentSkillId,
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

  public allowedActions = input<SkillAction[]>([]);

  public skillClicked = output<EquipmentSkill>();

  public animateItem = signal<string>('');

  salvageValue(item: EquipmentSkill) {
    return skillSalvageValue(item);
  }

  salvageItem(item: EquipmentSkill) {
    skillSalvage(item);
  }
}

import { Component, input, output } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { TippyDirective } from '@ngneat/helipopper';
import { skillSalvage, skillSalvageValue } from '@helpers';
import { EquipmentSkill } from '@interfaces';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';

export type SkillAction = 'Salvage';

@Component({
  selector: 'app-inventory-grid-skill',
  imports: [TippyDirective, DecimalPipe, IconSkillComponent],
  templateUrl: './inventory-grid-skill.component.html',
  styleUrl: './inventory-grid-skill.component.css',
})
export class InventoryGridSkillComponent {
  public skills = input.required<EquipmentSkill[]>();
  public clickableSkills = input<boolean>();

  public allowedActions = input<SkillAction[]>([]);

  public itemClicked = output<EquipmentSkill>();

  salvageValue(item: EquipmentSkill) {
    return skillSalvageValue(item);
  }

  salvageItem(item: EquipmentSkill) {
    skillSalvage(item);
  }
}

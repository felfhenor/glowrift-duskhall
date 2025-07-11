import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { rarityItemOutlineColor } from '../../helpers';
import { EquipmentSkillDefinition } from '../../interfaces';
import { AtlasAnimationComponent } from '../atlas-animation/atlas-animation.component';
import { IconBlankSlotComponent } from '../icon-blank-slot/icon-blank-slot.component';
import { StatsSkillComponent } from '../stats-skill/stats-skill.component';

@Component({
  selector: 'app-icon-skill',
  imports: [
    AtlasAnimationComponent,
    TippyDirective,
    IconBlankSlotComponent,
    NgClass,
    StatsSkillComponent,
  ],
  templateUrl: './icon-skill.component.html',
  styleUrl: './icon-skill.component.scss',
})
export class IconSkillComponent {
  public skill = input.required<EquipmentSkillDefinition>();

  public itemOutlineClass = computed(() =>
    rarityItemOutlineColor(this.skill().rarity),
  );
}

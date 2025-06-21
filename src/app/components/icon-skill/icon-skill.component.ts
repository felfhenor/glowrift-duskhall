import { Component, computed, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { uniq } from 'lodash';
import { EquipmentSkillDefinition } from '../../interfaces';
import { AtlasAnimationComponent } from '../atlas-animation/atlas-animation.component';
import { IconBlankSlotComponent } from '../icon-blank-slot/icon-blank-slot.component';

@Component({
  selector: 'app-icon-skill',
  imports: [AtlasAnimationComponent, TippyDirective, IconBlankSlotComponent],
  templateUrl: './icon-skill.component.html',
  styleUrl: './icon-skill.component.scss',
})
export class IconSkillComponent {
  public skill = input.required<EquipmentSkillDefinition>();
  public elements = computed(() =>
    uniq(this.skill().techniques.map((t) => t.elements)),
  );
}

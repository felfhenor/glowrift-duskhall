import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { StatsSkillComponent } from '@components/stats-skill/stats-skill.component';
import { getSkillEnchantLevel, rarityItemOutlineColor } from '@helpers';
import type { EquipmentSkill, EquipmentSkillContent } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

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
  public skill = input.required<EquipmentSkillContent>();
  public showEnchantLevel = input<boolean>(true);

  public skillEnchantLevel = computed(() =>
    getSkillEnchantLevel(this.skill() as EquipmentSkill),
  );

  public itemOutlineClass = computed(() =>
    rarityItemOutlineColor(this.skill().rarity),
  );
}

import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconComponent } from '@components/icon/icon.component';
import { StatsSkillCompareComponent } from '@components/stats-skill-compare/stats-skill-compare.component';
import { StatsSkillComponent } from '@components/stats-skill/stats-skill.component';
import { getSkillEnchantLevel } from '@helpers';
import type { Hero } from '@interfaces';
import { type EquipmentSkill, type EquipmentSkillContent } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-icon-skill',
  imports: [
    AtlasAnimationComponent,
    TippyDirective,
    IconBlankSlotComponent,
    NgClass,
    StatsSkillComponent,
    StatsSkillCompareComponent,
    IconComponent,
  ],
  templateUrl: './icon-skill.component.html',
  styleUrl: './icon-skill.component.scss',
})
export class IconSkillComponent {
  public skill = input.required<EquipmentSkillContent>();
  public compareSkill = input<EquipmentSkillContent>();
  public equippingHero = input<Hero>();
  public showEnchantLevel = input<boolean>(true);

  public skillEnchantLevel = computed(() =>
    getSkillEnchantLevel(this.skill() as EquipmentSkill),
  );
}

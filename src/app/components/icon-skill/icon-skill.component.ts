import { Component, computed, input } from '@angular/core';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconComponent } from '@components/icon/icon.component';
import { StatsSkillCompareComponent } from '@components/stats-skill-compare/stats-skill-compare.component';
import { StatsSkillComponent } from '@components/stats-skill/stats-skill.component';
import { skillEnchantLevel } from '@helpers';
import { findEquippedSkill, showContextMenuStats } from '@helpers/ui';
import type { Hero } from '@interfaces';
import { type EquipmentSkill, type EquipmentSkillContent } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-icon-skill',
  imports: [
    AtlasAnimationComponent,
    TippyDirective,
    IconBlankSlotComponent,
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
    skillEnchantLevel(this.skill() as EquipmentSkill),
  );

  public onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    
    const equippedData = findEquippedSkill(this.skill().id);
    if (!equippedData) {
      return; // Only show context menu for equipped skills
    }

    // Find what skill is currently in the same slot to compare with
    const currentSkill = equippedData.hero.skills[equippedData.slot];
    
    showContextMenuStats({
      x: event.clientX,
      y: event.clientY,
      skillData: this.skill(),
      compareSkill: currentSkill !== this.skill() ? currentSkill : undefined,
      equippingHero: equippedData.hero,
    });
  }
}

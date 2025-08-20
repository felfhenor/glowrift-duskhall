import { Component, input } from '@angular/core';
import { StatsItemCompareComponent } from '@components/stats-item-compare/stats-item-compare.component';
import { StatsItemComponent } from '@components/stats-item/stats-item.component';
import { StatsSkillCompareComponent } from '@components/stats-skill-compare/stats-skill-compare.component';
import { StatsSkillComponent } from '@components/stats-skill/stats-skill.component';
import type { Hero } from '@interfaces';
import type { EquipmentItemContent, EquipmentSkillContent } from '@interfaces';

@Component({
  selector: 'app-context-menu-stats-compare',
  imports: [
    StatsItemComponent,
    StatsItemCompareComponent,
    StatsSkillComponent,
    StatsSkillCompareComponent,
  ],
  templateUrl: './context-menu-stats-compare.component.html',
  styleUrl: './context-menu-stats-compare.component.scss',
})
export class ContextMenuStatsCompareComponent {
  public itemData = input<EquipmentItemContent>();
  public compareItem = input<EquipmentItemContent>();
  public skillData = input<EquipmentSkillContent>();
  public compareSkill = input<EquipmentSkillContent>();
  public equippingHero = input<Hero>();
}
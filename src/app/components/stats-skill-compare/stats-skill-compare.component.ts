import { Component, input } from '@angular/core';
import { StatsSkillComponent } from '@components/stats-skill/stats-skill.component';
import type { Hero } from '@interfaces';
import { type EquipmentSkill } from '@interfaces';

@Component({
  selector: 'app-stats-skill-compare',
  imports: [StatsSkillComponent],
  templateUrl: './stats-skill-compare.component.html',
  styleUrl: './stats-skill-compare.component.scss',
})
export class StatsSkillCompareComponent {
  public skill = input.required<EquipmentSkill>();
  public compareWith = input.required<EquipmentSkill>();
  public equippingHero = input<Hero>();
}
